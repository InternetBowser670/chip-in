import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, CoinFlipFace, GeneralHistory } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function fairCoinFlip(seed: string): CoinFlipFace {
  const hash = sha256(seed);
  return parseInt(hash.slice(0, 2), 16) < 128 ? "heads" : "tails";
}

export async function POST(req: Request) {
  const { betAmt, betFace } = await req.json();

  if (betFace !== "heads" && betFace !== "tails") {
    return NextResponse.json({ message: "Invalid bet face" }, { status: 400 });
  }

  if (betAmt <= 0 || !Number.isInteger(betAmt)) {
    return NextResponse.json(
      { message: "Invalid bet amount" },
      { status: 400 },
    );
  }

  const { mainDb } = await connectToDatabases(false);
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const users = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");

  const userDoc = await users.findOne(
    { id: clerkUser.id },
    { projection: { id: 1, totalChips: 1 } },
  );

  if (!userDoc) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const currentChips = userDoc.totalChips || 0;
  if (currentChips < betAmt) {
    return NextResponse.json(
      { message: "Insufficient chips" },
      { status: 400 },
    );
  }

  const serverSeed = crypto.randomBytes(32).toString("hex");
  const serverSeedHash = sha256(serverSeed);
  const outcome = fairCoinFlip(serverSeed);

  const isWin = betFace === outcome;
  const netChange = isWin ? betAmt : -betAmt;
  const updatedChips = currentChips + netChange;
  const now = Date.now();

  const historyDoc: GeneralHistory = {
    userId: clerkUser.id,
    type: "coinflip",
    betAmt,
    startCount: currentChips,
    endCount: updatedChips,
    change: netChange,
    date: now,
    actor: "user",
    version: "genHistory_v1",
    coinFlipData: { betFace, outcome },
  };

  await Promise.all([
    historyColl.insertOne(historyDoc),
    users.updateOne(
      { id: clerkUser.id },
      {
        $set: { totalChips: updatedChips },
        $inc: {
          coinFlipCount: 1,
          historyCount: 1,
          coinFlipProfit: netChange,
        },
      },
    ),
  ]);

  return NextResponse.json({
    outcome,
    updatedChips,
    serverSeedHash,
    serverSeed,
    status: 200,
  });
}
