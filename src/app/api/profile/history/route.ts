import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GeneralHistory } from "@/lib/types";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { mainDb } = await connectToDatabases(false);
  
  const history = await mainDb
    .collection<GeneralHistory>("history")
    .find({ userId: clerkUser.id })
    .sort({ date: 1 })
    .toArray();

  return NextResponse.json({ history });
}
