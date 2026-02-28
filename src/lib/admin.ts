import { connectToDatabases } from "@/lib/mongodb";

const ADMIN_IDS = ["user_327mnHFtfu53GG3queNB1TpZFVT", "user_327f5HQ2KhNPh2Sb02DUFQp1WqY", "user_34TiWDWUAcft43ObYNTBCDC0dwa"];

export async function verifyAdmin(userId: string): Promise<boolean> {
  if (ADMIN_IDS.includes(userId)) return true;

  const { mainDb } = await connectToDatabases(false);
  
  const userDoc = await mainDb.collection("users").findOne(
    { id: userId },
    { projection: { badges: 1 } }
  );

  if (!userDoc?.badges) return false;

  return userDoc.badges.some((badge: { name: string }) => badge.name === "admin");
}