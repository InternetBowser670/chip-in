import { User } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

export type CoinFlipFace = "heads" | "tails";

export interface SeeMoreProps {
    text: string;
    maxLength: number;
    className: string;
}

export interface UserHistory {
  type: string;
  betAmt: number;
  startCount: number;
  endCount: number;
  change: number;
  date: number;
  actor: string;
  version: string | "history_v1";
  coinFlipData?: {
    betFace: CoinFlipFace;
    outcome: CoinFlipFace;
  }

  blackjackData?: {
    gameId: string;
    outcome: "win" | "lose" | "push" | "blackjack";
  };
}

export interface CoinFlip {
    betAmt: number;
    betFace: CoinFlipFace;
    outcome: CoinFlipFace;
    startCount: number;
    endCount: number;
    date: number;
    version: string | "coinflip_v1";
    serverSeedHash?: string;
    serverSeed?: string;
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
  timezone: string;
  history: UserHistory[];
  coinFlips: CoinFlip[];
  badges: Badge[];
}

export interface PlayingCardProps {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
  width?: number;
}

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface BlackjackGame {
  gameId: string;
  betAmt: number;

  playerHand: Card[];
  dealerHand: Card[];

  deck: Card[];
  finished: boolean;
  outcome?: "win" | "lose" | "push" | "blackjack";

  startCount: number;
  endCount?: number;

  createdAt: number;
  completedAt?: number;

  serverSeedHash: string;
  serverSeed?: string;

  version: "blackjack_v1";
}

export interface Blackjack {
  gameId: string;
  betAmt: number;

  outcome: "win" | "lose" | "push" | "blackjack";

  startCount: number;
  endCount: number;
  change: number;

  playerHand: Card[];
  dealerHand: Card[];

  date: number;
  version: "blackjack_v1";

  serverSeedHash?: string;
  serverSeed?: string;
}