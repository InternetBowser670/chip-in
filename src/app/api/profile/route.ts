import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const start = performance.now();
  const timings: Record<string, string> = {};

  const mark = (label: string, startTime: number) => {
    timings[label] = `${(performance.now() - startTime).toFixed(2)}ms`;
    return performance.now();
  };

  try {
    // 1. Clerk Auth Latency
    let stepStart = performance.now();
    const clerkUser = await currentUser();
    stepStart = mark("clerk_auth", stepStart);

    if (!clerkUser) {
      return NextResponse.json({ status: 400 });
    }

    // 2. Database Connection Latency
    const useProdDB = false;
    const { mainDb } = await connectToDatabases(useProdDB);
    stepStart = mark("db_connection", stepStart);

    // 3. Query Execution Latency
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
              history: 1,
              minesCount: { $size: { $ifNull: ["$minesPlays", []] } },
              blackjackCount: { $size: { $ifNull: ["$blackjackPlays", []] } },
              coinFlipCount: { $size: { $ifNull: ["$coinFlips", []] } },
            },
          },
        )
        .toArray()
    )[0];
    
    mark("mongodb_query", stepStart);

    // Total time log
    const total = (performance.now() - start).toFixed(2);
    console.log(`⏱️ API Route Profile [${total}ms]:`, timings);

    return new Response(JSON.stringify({ user, _debug: timings }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Profile Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
