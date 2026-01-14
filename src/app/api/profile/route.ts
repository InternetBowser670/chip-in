import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ status: 400 });
  }

  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

  const usersCollection = await mainDb.collection("users");

  const user = (
    await usersCollection
      .find(
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
            history: 1
          },
        }
      )
      .toArray()
  )[0];

  return new Response(JSON.stringify({ user }), { status: 200 });
}
