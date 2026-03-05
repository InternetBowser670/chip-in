import { connectToDatabases } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { GeneralHistory } from "@/lib/types";

export async function POST(req: Request) {
  const {userId} = await req.json();

  const { mainDb } = await connectToDatabases(false);
  
  const history = await mainDb
    .collection<GeneralHistory>("history")
    .find({ userId: userId })
    .sort({ date: 1 })
    .toArray();

  return NextResponse.json({ history });
}