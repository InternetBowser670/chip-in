import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabases } from "@/lib/mongodb";
import { DateTime } from "luxon";

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

  return streak;
}

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

  const chipClaims: Record<string, number> = userDoc.chipClaims || {};
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
      streak: calculateStreak(chipClaims, timezone),
      total: userDoc.totalChips || 0,
    });
  }

  const yesterday = DateTime.now()
    .setZone(timezone)
    .minus({ days: 1 })
    .toFormat("yyyy-MM-dd");

  let streak = calculateStreak(chipClaims, timezone);
  if (lastClaimDateStr !== yesterday) {
    streak = 0;
  }
  
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
