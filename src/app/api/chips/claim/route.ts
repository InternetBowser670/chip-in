import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabases } from "@/lib/mongodb";
import { DateTime } from "luxon";
import { ChipInUser, GeneralHistory } from "@/lib/types";

export const dynamic = "force-dynamic";

const rewards = [
  { value: 3000, weight: 45 },
  { value: 5000, weight: 20 },
  { value: 10000, weight: 15 },
  { value: 15000, weight: 10 },
  { value: 20000, weight: 4 },
  { value: 30000, weight: 3 },
  { value: 40000, weight: 2 },
  { value: 50000, weight: 1 },
];

function getWeightedReward() {
  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
  const rand = Math.random() * totalWeight;
  let cumulative = 0;

  for (const reward of rewards) {
    cumulative += reward.weight;
    if (rand < cumulative) return reward.value;
  }

  return 3000;
}

export async function POST() {
  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ message: "Sign in required" }, { status: 401 });

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");

  const userDoc = await users.findOne(
    { id: clerkUser.id },
    { projection: { timezone: 1, chipClaims: 1, totalChips: 1 } },
  );

  if (!userDoc)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  const timezone = userDoc.timezone || "UTC";
  const today = DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd");
  const chipClaims = userDoc.chipClaims || {};

  if (chipClaims[today])
    return NextResponse.json({ message: "Already claimed" }, { status: 400 });

  const reward = getWeightedReward();

  const startCount = userDoc.totalChips || 0;
  const endCount = startCount + reward;

  const historyDoc: GeneralHistory = {
    userId: clerkUser.id,
    type: "daily-spin",
    betAmt: 0,
    startCount,
    endCount,
    change: reward,
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
          [`chipClaims.${today}`]: reward,
          totalChips: endCount,
        },
        $inc: { historyCount: 1 },
      },
    ),
  ]);

  return NextResponse.json({
    message: "Success",
    reward,
    total: endCount,
  });
}
