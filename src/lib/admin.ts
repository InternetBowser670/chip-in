import { connectToDatabases } from "@/lib/mongodb";

export async function verifyAdmin(userId: string): Promise<boolean> {
  const useProdDB = false;
  const { mainDb } = await connectToDatabases(useProdDB);

  const users = mainDb.collection("users");

  const userDoc = await users.findOne({ id: userId });

  if (!userDoc) {
    return false
  }

  if ((userDoc.badges?.some((badge: { name: string; }) => badge.name === "admin") == true || userId == "user_327mnHFtfu53GG3queNB1TpZFVT" || userId == "user_327f5HQ2KhNPh2Sb02DUFQp1WqY")) {
    return true;
  }
    
  return false;
}
