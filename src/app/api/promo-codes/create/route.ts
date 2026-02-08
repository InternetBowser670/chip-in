import { verifyAdmin } from "@/lib/admin";
import { connectToDatabases } from "@/lib/mongodb";
import { PromoCode } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code, value, expiryDate, startDate, maxUsers } = await req.json();

  if (value <= 0) {
    return NextResponse.json({ message: "Value must be greater than 0" }, { status: 400 });
  }

  const clerkUser = await currentUser();

  if (!clerkUser || !(await verifyAdmin(clerkUser.id))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { mainDb } = await connectToDatabases(false);
  const promoCodesColl = mainDb.collection<PromoCode>("promo-codes");

  const existingCode = await promoCodesColl.findOne({ codeName: code });
  if (existingCode) {
    return NextResponse.json(
      { message: "A promo code with this name already exists." },
      { status: 409 }
    );
  }

  const promoCodeObj: PromoCode = {
    creator: clerkUser.id,
    dateCreated: Date.now(),
    codeName: code,
    chipValue: +value,
    expiryDate,
    usersClaimed: [],
    maxUsers,
    type: "promoCode_v1",
    startDate
  };

  await promoCodesColl.insertOne(promoCodeObj);

  return NextResponse.json({ message: "Promo code created successfully" }, { status: 200 });
}