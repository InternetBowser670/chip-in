import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { ChipInUser, UserHistory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId, amt, mode } = await req.json();

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ isAdmin: false });
  }

  if (!(await verifyAdmin(clerkUser.id))) {
    return NextResponse.json({ isAdmin: false });
  }

  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

  const users = mainDb.collection<ChipInUser>("users");

  const userDoc = await users.findOne({ id: userId });

  if (!userDoc) {
    return NextResponse.json(
      { message: "User document not found" },
      { status: 404 }
    );
  }

  if (mode === "set") {
    await users.updateOne(
      { id: userId },
      {
        $set: { totalChips: amt },
        $push: {
          history: {
            $each: [
              {
                type: "chipSet",
                startCount: userDoc.totalChips ?? 0,
                endCount: amt,
                change: amt - (userDoc.totalChips ?? 0),
                date: Date.now(),
                actor: "admin",
                version: "history_v3",
              } as UserHistory,
            ],
          },
        },
      }
    );
    return NextResponse.json(
      { message: `Chips set to ${amt} for ${userId} successfully`, amt, userId},
      { status: 200 }
    );
  } else if (mode === "increment") {
    await users.updateOne(
      { id: userId },
      {
        $inc: { totalChips: amt },
        $push: {
          history: {
            $each: [
              {
                type: "chipIncrement",
                startCount: userDoc.totalChips ?? 0,
                endCount: (userDoc.totalChips ?? 0) + amt,
                change: amt,
                date: Date.now(),
                actor: "admin",
                version: "history_v3",
              } as UserHistory,
            ],
          },
        },
      }
    );

    return NextResponse.json(
      { message: "Chips incremented successfully" },
      { status: 200 }
    );
  }
}
