import { User } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

export interface SeeMoreProps {
    text: string;
    maxLength: number;
    className: string;
}

export interface UserHistory {
  type: string;
  startCount: number;
  endCount: number;
  change: number;
  date: number;
  actor: string;
  version: string | "history_v1";
}

export interface CoinFlip {
    betAmt: number;
    betFace: "heads" | "tails";
    outcome: "heads" | "tails";
    startCount: number;
    endCount: number;
    date: number;
}
export interface Badge {
    name: string;
    dateEarned: number;
    description?: string;
    iconUrl?: string;
}
export interface ChipInUser extends User {
  _id: ObjectId;

  totalChips: number;
  chipClaims: Record<string, number>;

  history: UserHistory[];
  coinFlips: CoinFlip[];
  badges: Badge[];
}
