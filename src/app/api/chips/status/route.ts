import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabases } from "@/lib/mongodb";
import { DateTime } from "luxon";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection("users");

  const userDoc = await users.findOne({ id: clerkUser.id });
  if (!userDoc) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (!userDoc.timezone) {
    return NextResponse.json(
      { message: "No timezone set. Please refresh to set timezone." },
      { status: 400 }
    );
  }

  const timezone = userDoc.timezone;
  const today = DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd");

  const chipClaims = userDoc.chipClaims || {};
  let streak = userDoc.streak || 0;

  const claimDates = Object.keys(chipClaims).sort();
  const lastClaimDateStr = claimDates[claimDates.length - 1];

  if (chipClaims[today]) {
    const nextAvailable = DateTime.now()
      .setZone(timezone)
      .plus({ days: 1 })
      .startOf("day")
      .toISO();
    return NextResponse.json({
      canClaim: false,
      amount: null,
      nextAvailable,
      streak,
      total: userDoc.totalChips || 0,
    });
  }

  const yesterday = DateTime.now()
    .setZone(timezone)
    .minus({ days: 1 })
    .toFormat("yyyy-MM-dd");
  if (lastClaimDateStr !== yesterday) {
    streak = 0;
  }

  streak += 1;
  const chips = Math.floor(
    (Math.ceil(10 * Math.cbrt(streak) * Math.pow(streak, 1 / 10)) / 10) * 1000
  );

  return NextResponse.json({
    canClaim: true,
    amount: chips,
    nextAvailable: null,
    streak,
    total: userDoc.totalChips || 0,
  });
}
