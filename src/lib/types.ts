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
  };
  blackjackData?: {
    gameId: string;
    outcome: "win" | "lose" | "push" | "blackjack";
  };
  minesData?: {
    gameId: string;
    minesCount: number;
    grid: MinesGrid;
    tilesFlippedCount: number;
    tilesFlipped: FlippedTile[];
    finalMultiplier: number;
    fairness: {
      serverSeed: string;
      clientSeed: string;
      nonce: number;
    };
  };
}

export interface GeneralHistory {
  userId: string;
  type: string;
  betAmt: number;
  startCount: number;
  endCount: number;
  change: number;
  date: number;
  actor: string;
  version: string | "genHistory_v1";
  coinFlipData?: {
    betFace: CoinFlipFace;
    outcome: CoinFlipFace;
  };
  blackjackData?: {
    gameId: string;
    outcome: "win" | "lose" | "push" | "blackjack";
  };
  minesData?: {
    gameId: string;
    minesCount: number;
    grid: MinesGrid;
    tilesFlippedCount: number;
    tilesFlipped: FlippedTile[];
    finalMultiplier: number;
    fairness: {
      serverSeed: string;
      clientSeed: string;
      nonce: number;
    };
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
  timezone: string;
  minesCount: number;
  blackjackCount: number;
  coinFlipCount: number;
  historyCount: number;
  activeBlackjack?: BlackjackGame;
  activeMinesGame?: MinesGame;
  badges?: Badge[];
  chipClaims: Record<string, number>;
  coinFlipProfit: number;
  blackjackProfit: number;
  minesProfit: number;
}

export interface PlayingCardProps {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: Rank;
  width?: number;
  className?: string;
  faceDown?: boolean;
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
  | "K"
  | "a"
  | "j"
  | "q"
  | "k";

export interface Card {
  suit: Suit;
  rank: Rank;
  faceDown?: true;
}

export interface BlackjackHand {
  cards: Card[];
  finished: boolean;
  bet: number;
  doubled?: boolean;
}

export interface BlackjackGame {
  gameId: string;
  betAmt: number;
  dealerHand: Card[];
  hands: BlackjackHand[];
  deck: Card[];
  finished: boolean;
  startCount: number;
  endCount?: number;
  createdAt: number;
  completedAt?: number;
  serverSeedHash: string;
  serverSeed: string;
  activeHandIndex: number;
  version: "blackjack_v1" | string;
}

export interface BlackjackHistory {
  gameId: string;
  betAmt: number;
  startCount: number;
  endCount: number;
  change: number;
  playerHands: Card[][];
  dealerHand: Card[];
  date: number;
  version: "blackjack_v1" | string;
  userId: string;
  serverSeedHash: string;
  serverSeed: string;
}

export type BlackjackHandOutcome =
  | "win"
  | "lose"
  | "push"
  | "blackjack"
  | "bust";

export interface BlackjackFinalHand {
  cards: Card[];
  outcome: BlackjackHandOutcome;
  betAmt: number;
  doubled: boolean;
}

export interface ResolvedHand {
  cards: Card[];
  outcome: BlackjackHandOutcome;
  betAmt: number;
  doubled: boolean;
}

export interface ProfileData {
  id: string;
  username: string;
  image_url: string;
  has_image: boolean;
  totalChips: number;
  created_at: number;
  badges: Badge[];
  last_active_at: number;
  history: (UserHistory | BlackjackHistory)[];
}

export type Candle = {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
};

export interface MinesTileType {
  value?: "mine" | "safe";
  revealed: boolean;
}

export type MinesRow = MinesTileType[];

export type MinesGrid = MinesRow[];

export type MinesGame = {
  gameId: string;
  betAmt: number;
  minesCount: number;
  grid: MinesGrid;
  finished: boolean;
  startCount: number;
  createdAt: number;
  tilesFlippedCount: number;
  tilesFlipped: {
    coordinates: [number, number];
    value: "mine" | "safe";
  }[];
  fairness: {
    serverSeedHash: string;
    serverSeed: string | null;
    clientSeed: string;
    nonce: number;
  };
};

export type MinesAction =
  | {
      type: "start";
      info: {
        betAmt: number;
        minesCount: number;
        clientSeed?: string;
      };
    }
  | { type: "resume" }
  | { type: "flip"; info: { tileCoordinates: [number, number] } }
  | { type: "cashout" };

export type FlippedTile = {
  coordinates: [number, number];
  value: "mine" | "safe";
};

export interface PromoCode {
  codeName: string;
  chipValue: number;
  expiryDate?: number;
  usersClaimed?: string[];
  creator: string;
  maxUsers?: number;
  type: "promoCode_v1";
  dateCreated: number;
  startDate?: Date;
  forceAvailable?: "always" | "never";
}
