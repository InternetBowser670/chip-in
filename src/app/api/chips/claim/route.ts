import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabases } from "@/lib/mongodb";
import { DateTime } from "luxon";

export const dynamic = "force-dynamic";

// chip formula: ceil(10 * cbrt(x) * pow(x, 1/10)) / 10 * 1000
function calculateChips(day: number): number {
  return (Math.ceil(10 * Math.cbrt(day) * Math.pow(day, 1 / 10)) / 10) * 1000;
}

export async function POST() {
  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json(
      { message: "You must sign in to claim chips" },
      { status: 401 }
    );
  }

  const users = mainDb.collection("users");

  const userDoc = await users.findOne({ id: clerkUser.id });
  if (!userDoc) {
    return NextResponse.json(
      { message: "User document not found" },
      { status: 404 }
    );
  }

  const timezone = userDoc.timezone || "UTC";
  const today = DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd");

  const chipClaims = userDoc.chipClaims || {};
  const totalChips = userDoc.totalChips || 0;

  if (chipClaims[today]) {
    return NextResponse.json(
      { message: "Already claimed chips today" },
      { status: 400 }
    );
  }

  const claimCount = Object.keys(chipClaims).length + 1;
  const chips = calculateChips(claimCount);

  await users.updateOne(
    { id: clerkUser.id },
    {
      $set: {
        [`chipClaims.${today}`]: chips,
        totalChips: totalChips + chips,
      },
    }
  );

  return NextResponse.json(
    {
      message: "Success",
      claimed: chips,
      total: totalChips + chips,
    },
    { status: 200 }
  );
}
