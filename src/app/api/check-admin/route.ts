import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json(
      { isAdmin: false }
    );
  }

  const users = mainDb.collection("users");

  const userDoc = await users.findOne({ id: clerkUser.id });

  if (!userDoc) {
    return NextResponse.json(
      { isAdmin: false }
    );
  }
  
  if (!(userDoc.badges?.some((badge: { name: string; }) => badge.name === "admin") == true || clerkUser.id == "user_327mnHFtfu53GG3queNB1TpZFVT" || clerkUser.id == "user_327f5HQ2KhNPh2Sb02DUFQp1WqY")) {
    return NextResponse.json({ isAdmin: false });
  }

  return NextResponse.json({ isAdmin: true });
}
