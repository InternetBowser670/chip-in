import { connectToDatabases } from "@/lib/mongodb";
import { ChipInUser, GeneralHistory } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function oneInThree(seed: string) {
  const hash = sha256(seed);
  //Generates random number 1-3 inclusive
  return Math.floor(parseInt(hash.slice(0,2), 16) / 86) + 1;
}


