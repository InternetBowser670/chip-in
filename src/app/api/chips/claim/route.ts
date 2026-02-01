import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabases } from "@/lib/mongodb";
import { DateTime } from "luxon";
import { ChipInUser, GeneralHistory } from "@/lib/types";

export const dynamic = "force-dynamic";

function calculateChips(day: number): number {
  return Math.floor(
    (Math.ceil(10 * Math.cbrt(day) * Math.pow(day, 1 / 10)) / 10) * 1000
  );
}

function calculateStreak(claims: Record<string, number>, timezone: string): number {
  const claimDates = Object.keys(claims).sort();
  if (claimDates.length === 0) return 0;
  let streak = 1;
  let currentDate = DateTime.fromFormat(claimDates[claimDates.length - 1], "yyyy-MM-dd", { zone: timezone });
  for (let i = claimDates.length - 2; i >= 0; i--) {
    currentDate = currentDate.minus({ days: 1 });
    if (claimDates[i] === currentDate.toFormat("yyyy-MM-dd")) streak++;
    else break;
  }
  return streak + 1;
}

export async function POST() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ message: "Sign in required" }, { status: 401 });

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");

  const userDoc = await users.findOne(
    { id: clerkUser.id },
    { projection: { timezone: 1, chipClaims: 1, totalChips: 1 } }
  );

  if (!userDoc) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const timezone = userDoc.timezone || "UTC";
  const today = DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd");
  const chipClaims = userDoc.chipClaims || {};

  if (chipClaims[today]) return NextResponse.json({ message: "Already claimed" }, { status: 400 });

  const claimDates = Object.keys(chipClaims).sort();
  const yesterday = DateTime.now().setZone(timezone).minus({ days: 1 }).toFormat("yyyy-MM-dd");
  
  let streak = calculateStreak(chipClaims, timezone);
  if (claimDates.length > 0 && claimDates[claimDates.length - 1] !== yesterday) {
    streak = 1;
  }

  const chips = calculateChips(streak);
  const startCount = userDoc.totalChips || 0;
  const endCount = startCount + chips;

  const historyDoc: GeneralHistory = {
    userId: clerkUser.id,
    type: "daily-claim",
    betAmt: 0,
    startCount,
    endCount,
    change: chips,
    date: Date.now(),
    actor: "user",
    version: "genHistory_v1",
  };
  
  await Promise.all([
    historyColl.insertOne(historyDoc),
    users.updateOne(
      { id: clerkUser.id },
      {
        $set: { 
          [`chipClaims.${today}`]: chips,
          totalChips: endCount,
        },
        $inc: { historyCount: 1 }
      }
    )
  ]);

  return NextResponse.json({ message: "Success", claimed: chips, total: endCount });
}
