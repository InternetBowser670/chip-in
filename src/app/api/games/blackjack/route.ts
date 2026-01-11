import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  Card,
  BlackjackGame,
  BlackjackHistory,
  ChipInUser,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function sha256(v: string) {
  return crypto.createHash("sha256").update(v).digest("hex");
}

function generateDeck(): Card[] {
  const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"] as const;
  return suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));
}

function shuffle(deck: Card[], seed: string): Card[] {
  let hash = sha256(seed);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = parseInt(hash.slice(0, 8), 16) % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
    hash = sha256(hash);
  }
  return deck;
}

function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const c of cards) {
    if (c.rank === "A") {
      aces++;
      total += 11;
    } else if (["K", "Q", "J"].includes(c.rank)) {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }

  while (total > 21 && aces--) total -= 10;
  return total;
}