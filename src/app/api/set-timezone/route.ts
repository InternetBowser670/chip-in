import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabases } from "@/lib/mongodb";

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { timezone } = await req.json();

  if (!timezone || typeof timezone !== "string") {
    return NextResponse.json({ message: "Invalid timezone" }, { status: 400 });
  }

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection("users");

  await users.updateOne({ id: clerkUser.id }, { $set: { timezone } });

  return NextResponse.json(
    { message: "Timezone saved", timezone },
    { status: 200 }
  );
}
