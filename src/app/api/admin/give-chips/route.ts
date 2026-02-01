import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { ChipInUser, GeneralHistory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId, amt, mode } = await req.json();

  const clerkUser = await currentUser();
  if (!clerkUser || !(await verifyAdmin(clerkUser.id))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");

  // Slim projection to prevent loading large arrays
  const userDoc = await users.findOne({ id: userId }, { projection: { totalChips: 1 } });

  if (!userDoc) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const startCount = userDoc.totalChips ?? 0;
  const endCount = mode === "set" ? amt : startCount + amt;
  const change = endCount - startCount;

  const historyDoc: GeneralHistory = {
    userId,
    type: mode === "set" ? "chipSet" : "chipIncrement",
    betAmt: 0,
    startCount,
    endCount,
    change,
    date: Date.now(),
    actor: "admin",
    version: "genHistory_v1",
  };

  // Atomic update: User chips and External history
  await Promise.all([
    historyColl.insertOne(historyDoc),
    users.updateOne(
      { id: userId },
      { 
        $set: { totalChips: endCount },
        $inc: { historyCount: 1 } 
      }
    )
  ]);

  return NextResponse.json({ 
    message: `Chips ${mode === "set" ? 'set' : 'incremented'} successfully`, 
    amt: endCount, 
    userId 
  });
}
