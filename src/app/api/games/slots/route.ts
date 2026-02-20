import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, CoinFlipFace, GeneralHistory } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";