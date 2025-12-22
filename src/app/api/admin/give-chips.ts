/* eslint-disable @typescript-eslint/no-unused-vars */
import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export default async function POST(req: Request) {
    const { userId, amt } = await req.json();
}