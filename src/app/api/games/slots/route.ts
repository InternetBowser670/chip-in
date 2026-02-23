import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, GeneralHistory } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function oneInThree(seed: string) {
  const hash = sha256(seed);
  //Generates random number 1-3 inclusive
  return Math.floor(parseInt(hash.slice(0,2), 16) / 86) + 1;
}

export async function POST(req: Request) {
  console.log('POST succeded')
  
    const { betAmt, slots } = await req.json();

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
  
  //For each outcome, 1 & 2 = bomb, 3 = 7
  //And no, im not putting 'bomb' or '7' in the acutal outcomes variable for animation purposes
  const outcomes = [];
  for (const slot of slots) {
    outcomes.push(oneInThree(serverSeed));
  };
  let isWin = true;
  for (const slot of slots) {
    if (slot != 2) {
        isWin = false;
        break;
    }
  }

  const netChange = isWin ? betAmt : -betAmt;
  const updatedChips = currentChips + netChange;
  const now = Date.now();
  const gameId = crypto.randomUUID();
  
  
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
    slotsData: {gameId, outcomes}
  }  
  
  await Promise.all([
    historyColl.insertOne(historyDoc),
    users.updateOne(
      { id: clerkUser.id },
      {
        $set: { totalChips: updatedChips },
        $inc: {
          slotsCount: 1,
          historyCount: 1,
          slotsProfit: netChange,
        },
      },
    ),
  ]);

  return NextResponse.json({
    outcomes,
    updatedChips,
    serverSeedHash,
    serverSeed,
    status: 200,
  });
}
