import { connectToDatabases } from "@/lib/mongodb";

export async function POST() {
  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

    const usersCollection = await mainDb.collection("users");

    const users = await usersCollection
      .find({}, { projection: { id: 1, username: 1, image_url: 1, has_image: 1, totalChips: 1 } })
      .toArray();

  return new Response(JSON.stringify({ users }), { status: 200 });
}
