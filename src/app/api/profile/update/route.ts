import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    const { section, value } = await req.json();

    const { mainDb } = await connectToDatabases(false);

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({message: "Error: Could not find user"}, { status: 400 });
    
    await mainDb.collection("users").updateOne(
        { id: clerkUser.id },
        {$set: { [section]: value }}
    );
  
    return NextResponse.json({message: "Profile Updated Successfully!"}, {status: 200});
}