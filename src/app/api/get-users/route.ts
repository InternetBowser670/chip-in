import { connectToDatabases } from "@/lib/mongodb";

export async function POST() {
  const useProdDB = true;
  const { mainDb } = await connectToDatabases(useProdDB);

    const usersCollection = mainDb.collection("users");
    const users = await usersCollection
      .find({}, { projection: { id: 1, username: 1, image_url: 1, has_image: 1 } })
      .toArray();

      console.log("Fetched users:", users);

  return new Response(JSON.stringify({ users }), { status: 200 });
}
