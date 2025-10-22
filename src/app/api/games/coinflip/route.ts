import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

  const users = mainDb.collection("users");

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

  const outcome = Math.random() < 0.5 ? "heads" : "tails";

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
        },
        history: {
          type: "coinflip",
          betFace,
          outcome,
          betAmt,
          startCount: userDoc.totalChips || 0,
          endCount: updatedChips,
          change: betFace === outcome ? betAmt : -betAmt,
          date: Date.now(),
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    { upsert: true }
  );

  return NextResponse.json({ outcome, updatedChips, status: 200 });
}
