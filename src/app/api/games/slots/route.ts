import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, GeneralHistory } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function oneInN(seed: string, n: number) {
  const hash = sha256(seed);
  //Generates random number 0-255
  const x = parseInt(hash.slice(0, 2), 16);
  //Generates random number 1-n inclusive 
  return Math.floor((x * n) / 256) + 1;
}

export async function POST(req: Request) {
  const { betAmt, reels } = await req.json();


  let itemsPerReel = 5;
  
  //Prepraration for variable reels
  const reelsCount = Number(reels);
  if (
    Number.isNaN(reelsCount) ||
    !Number.isInteger(reelsCount) ||
    reelsCount <= 0
  ) {
    return NextResponse.json(
      { message: "Invalid reels count" },
      { status: 400 },
    );
  }

  //Return calc- very complex. Multipliers for 3 reels, 5 items per reel are 
  //Jackpot around 7x
  //Noraml win around 1.4x
  const winReturn = 
  (0.98 * (itemsPerReel ** (reels - 1))) /
  (reels * (itemsPerReel - 1) + itemsPerReel);
  const jackpotReturn = itemsPerReel * winReturn;

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

  let serverSeed;
  let serverSeedHash;
  
  const outcomes: number[] = [];
  for (let i = 0; i < reelsCount; i++) {
    //Server seed & Hash NEED to be regenerated every time or else you will always win
    serverSeed = crypto.randomBytes(32).toString("hex");
    serverSeedHash = sha256(serverSeed);
    outcomes.push(oneInN(serverSeed, itemsPerReel));
  }

  //UPDATE THIS IF ADDING VARIABLE REELS
  let isJackpot = false;
  let isWin = false;
  const [a, b, c] = outcomes;

  if (a === b && b === c) {
    isJackpot = true;
  } else if (a === b || a === c || b === c) {
    isWin = true;
  } else {
    isWin = false;
  };

  //iccl if its a nested ternary operator
  const netChange = isJackpot? 
  Math.floor(betAmt * jackpotReturn)-betAmt: 
  isWin? Math.floor(betAmt * winReturn)-betAmt:
  -betAmt;
  const updatedChips = currentChips + netChange;
  const now = Date.now();
  const gameId = crypto.randomUUID();
  
  
  const historyDoc: GeneralHistory = {
    userId: clerkUser.id,
    type: "slots",
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

  return NextResponse.json(
    {
      outcomes,
      updatedChips,
      serverSeed,
    },
    { status: 200 },
  );
}
