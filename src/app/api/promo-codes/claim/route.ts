import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, GeneralHistory, PromoCode } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = clerkUser.id;

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");
  const promoCodesColl = mainDb.collection<PromoCode>("promo-codes");

  const userDoc = await users.findOne(
    { id: clerkUser.id },
    { projection: { totalChips: 1 } },
  );

  if (!userDoc) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const startCount = userDoc.totalChips ?? 0;
  const endCount = startCount + 100;
  const change = endCount - startCount;

  const historyDoc: GeneralHistory = {
    userId,
    type: "promoCode",
    betAmt: 0,
    startCount,
    endCount,
    change,
    date: Date.now(),
    actor: "admin",
    version: "genHistory_v1",
  };

  return NextResponse.json({ status: 501 });
}
