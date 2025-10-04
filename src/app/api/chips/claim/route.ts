import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabases } from "@/lib/mongodb";
import { DateTime } from "luxon";

export const dynamic = "force-dynamic";

// chip formula: ceil(10 * cbrt(x) * pow(x, 1/10)) / 10 * 1000
function calculateChips(day: number): number {
  return Math.floor(
    (Math.ceil(10 * Math.cbrt(day) * Math.pow(day, 1 / 10)) / 10) * 1000
  );
}

function calculateStreak(
  claims: Record<string, number>,
  timezone: string
): number {
  const claimDates = Object.keys(claims).sort();
  if (claimDates.length === 0) return 0;

  let streak = 1;
  let currentDate = DateTime.fromFormat(
    claimDates[claimDates.length - 1],
    "yyyy-MM-dd",
    { zone: timezone }
  );

  for (let i = claimDates.length - 2; i >= 0; i--) {
    currentDate = currentDate.minus({ days: 1 });
    const expectedDate = currentDate.toFormat("yyyy-MM-dd");

    if (claimDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak + 1;
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

  const chipClaims: Record<string, number> = userDoc.chipClaims || {};
  const claimDates = Object.keys(chipClaims).sort();
  const lastClaimDateStr = claimDates[claimDates.length - 1];

  const totalChips = userDoc.totalChips || 0;

  if (chipClaims[today]) {
    return NextResponse.json(
      { message: "Already claimed chips today" },
      { status: 400 }
    );
  }

  const yesterday = DateTime.now()
    .setZone(timezone)
    .minus({ days: 1 })
    .toFormat("yyyy-MM-dd");

  let streak = calculateStreak(chipClaims, timezone);

  if (lastClaimDateStr !== yesterday) {
    streak = 1;
  }

  const chips = calculateChips(streak);

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
