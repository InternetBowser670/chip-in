import { connectToDatabases } from "@/lib/mongodb";

export async function POST() {
  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

  const usersCollection = await mainDb.collection("users");

  const users = await usersCollection
    .aggregate([
      {
        $project: {
          id: 1,
          username: 1,
          image_url: 1,
          has_image: 1,
          totalChips: 1,
          created_at: 1,
          badges: 1,
          last_active_at: 1,
          minesPlays: { $size: { $ifNull: ["$minesPlays", []] } },
          blackjackPlays: { $size: { $ifNull: ["$blackjackPlays", []] } },
          coinFlips: { $size: { $ifNull: ["$coinFlips", []] } },
          history: { $size: { $ifNull: ["$history", []] } },
        },
      },
    ])
    .toArray();

  return new Response(JSON.stringify({ users }), { status: 200 });
}
