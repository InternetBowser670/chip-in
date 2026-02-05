import { connectToDatabases } from "@/lib/mongodb";
import { PromoCode } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json(
      { message: "Invalid promo code" },
      { status: 400 }
    );
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { mainDb } = await connectToDatabases(false);
  const promoCodes = mainDb.collection<PromoCode>("promo-codes");

  const now = Date.now();

  const result = await promoCodes.findOneAndUpdate(
    {
      codeName: code,
      startDate: { $lte: now },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: now } },
      ],
      usersClaimed: { $ne: clerkUser.id },
      $expr: {
        $lt: [{ $size: "$usersClaimed" }, "$maxUsers"],
      },
    },
    {
      $push: { usersClaimed: clerkUser.id },
    },
    {
      returnDocument: "after",
    }
  );

  if (!result.value) {
    return NextResponse.json(
      { message: "Promo code is invalid, expired, or already claimed" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      message: "Promo code claimed successfully",
      chipValue: result.value.chipValue,
    },
    { status: 200 }
  );
}
