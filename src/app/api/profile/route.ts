import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ status: 400 });

    const { mainDb } = await connectToDatabases(false);
    
    const user = await mainDb.collection("users").findOne(
      { id: clerkUser.id },
      {
        projection: {
          id: 1,
          username: 1,
          image_url: 1,
          has_image: 1,
          totalChips: 1,
          created_at: 1,
          badges: 1,
          last_active_at: 1,
          minesCount: 1,
          blackjackCount: 1,
          coinFlipCount: 1,
          minesProfit: 1,
          blackjackProfit: 1,
          coinFlipProfit: 1,
        },
      }
    );

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
