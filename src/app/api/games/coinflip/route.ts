import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, CoinFlip, CoinFlipFace, UserHistory } from "@/lib/types";
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
      { status: 400 }
    );
  }

  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json(
      { message: "You must sign in to claim chips" },
      { status: 401 }
    );
  }

  const users = mainDb.collection<ChipInUser>("users");

  const userDoc = await users.findOne({ id: clerkUser.id });
  if (!userDoc) {
    return NextResponse.json(
      { message: "User document not found" },
      { status: 404 }
    );
  }

  if ((userDoc.totalChips || 0) < betAmt) {
    return NextResponse.json(
      { message: "Insufficient chips for this bet" },
      { status: 400 }
    );
  }

  const serverSeed = crypto.randomBytes(32).toString("hex");
  const serverSeedHash = sha256(serverSeed);
  const outcome = fairCoinFlip(serverSeed);

  let updatedChips = userDoc.totalChips || 0;

  if (betFace === outcome) {
    updatedChips += betAmt;
  } else {
    updatedChips -= betAmt;
  }

  await users.updateOne(
    { id: clerkUser.id },
    {
      $set: {
        totalChips: updatedChips,
      },
      $push: {
        coinFlips: {
          betAmt,
          betFace,
          outcome,
          startCount: userDoc.totalChips || 0,
          endCount: updatedChips,
          date: Date.now(),
          serverSeedHash,
          serverSeed,
          version: "coinflip_v2",
        } as CoinFlip,
        history: {
          type: "coinflip",
          coinFlipData: { betFace, outcome },
          betAmt,
          startCount: userDoc.totalChips || 0,
          endCount: updatedChips,
          change: betFace === outcome ? betAmt : -betAmt,
          date: Date.now(),
          actor: "user",
          version: "history_v3",
        } as UserHistory,
      },
    }
  );

  return NextResponse.json({ outcome, updatedChips, serverSeedHash, serverSeed, status: 200 });
}
