import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, PromoCode, GeneralHistory } from "@/lib/types";
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

  const userId = clerkUser.id;

  const { mainDb } = await connectToDatabases(false);
  const usersColl = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");
  const promoCodesColl = mainDb.collection<PromoCode>("promo-codes");

  const userDoc = await usersColl.findOne({ id: userId });
  if (!userDoc) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const promo = await promoCodesColl.findOne({ codeName: code });
  if (!promo) {
    return NextResponse.json(
      { message: "Promo code does not exist" },
      { status: 404 }
    );
  }

  const now = Date.now();

  if (promo.startDate && promo.startDate && now < promo.startDate) {
    return NextResponse.json(
      { message: "Promo code is not active yet" },
      { status: 403 }
    );
  }

  if (promo.expiryDate && promo.expiryDate && now > promo.expiryDate) {
    return NextResponse.json(
      { message: "Promo code has expired" },
      { status: 410 }
    );
  }

  if (promo.usersClaimed && promo.usersClaimed.includes(userId)) {
    return NextResponse.json(
      { message: "Promo code already claimed" },
      { status: 409 }
    );
  }

  if (
    typeof promo.maxUsers === "number" &&
    promo.usersClaimed &&
    promo.usersClaimed.length >= promo.maxUsers
  ) {
    return NextResponse.json(
      { message: "Promo code has reached its usage limit" },
      { status: 410 }
    );
  }

  const reward = promo.chipValue;
  const startCount = userDoc.totalChips ?? 0;
  const endCount = startCount + reward;
  const change = reward;

  await usersColl.updateOne(
    { id: userId },
    { $set: { totalChips: endCount } }
  );

  await promoCodesColl.updateOne(
    { codeName: code },
    { $push: { usersClaimed: userId } }
  );

  const historyDoc: GeneralHistory = {
    userId,
    type: "promocode",
    betAmt: 0,
    startCount,
    endCount,
    change,
    date: now,
    actor: "system",
    version: "history_v1",
    promoCodeData: {
      code: promo.codeName,
      reward,
      rewardType: "chips",
      usesRemaining:
        typeof promo.maxUsers === "number"
          ? promo.maxUsers - (promo.usersClaimed?.length ?? 0 + 1)
          : undefined,
    },
  };

  await historyColl.insertOne(historyDoc);

  return NextResponse.json(
    {
      message: "Promo code claimed successfully",
      reward,
      newBalance: endCount,
    },
    { status: 200 }
  );
}
