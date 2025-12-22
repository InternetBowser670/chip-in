
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";

export async function GET() {

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json(
      { isAdmin: false }
    );
  }

  if ((await verifyAdmin(clerkUser.id))) {
    return NextResponse.json({ isAdmin: true });
  } else {
    return NextResponse.json({ isAdmin: false });
  }
}
