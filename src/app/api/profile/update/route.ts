import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    const { section, value } = await req.json();

    const { mainDb } = await connectToDatabases(false);

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({message: "Error: Could not find user"}, { status: 400 });
    
    try {
        const result = await mainDb.collection("users").updateOne(
            { id: clerkUser.id },
            { $set: { [section]: value } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({message: "Error: User not found in database"}, { status: 404 });
        }

        if (result.modifiedCount === 0) {
            return NextResponse.json({message: "Error: No updates detected"}, { status: 400 });
        }

        return NextResponse.json({message: "Updated Successfully!"}, {status: 200});
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({message: "Error: Internal server error"}, { status: 500 });
    }
}