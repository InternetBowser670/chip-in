import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  Card,
  BlackjackGame,
  ChipInUser,
  ResolvedHand,
  BlackjackHandOutcome,
  GeneralHistory,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function sha256(v: string) {
  return crypto.createHash("sha256").update(v).digest("hex");
}

function generateDeck(): Card[] {
  const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
  const ranks = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ] as const;
  return suits.flatMap((s) => ranks.map((r) => ({ suit: s, rank: r })));
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
    } else if (["K", "Q", "J"].includes(c.rank.toLocaleUpperCase())) {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }
  while (total > 21 && aces--) total -= 10;
  return total;
}

export async function POST(req: Request) {
  const { action, betAmt } = await req.json();
  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");

  const user = await users.findOne(
    { id: clerkUser.id },
    {
      projection: {
        id: 1,
        totalChips: 1,
        activeBlackjack: 1,
        blackjackCount: 1,
        historyCount: 1,
        blackjackProfit: 1,
      },
    },
  );

  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  if (action === "resume") {
    const g = user.activeBlackjack;
    if (!g || g.finished) return NextResponse.json({ active: false });
    return NextResponse.json({
      active: true,
      gameId: g.gameId,
      betAmt: g.betAmt,
      hands: g.hands.map((h) => h.cards),
      dealerHand: [g.dealerHand[0]],
      activeHand: g.activeHandIndex,
      serverSeedHash: g.serverSeedHash,
    });
  }

  if (action === "start") {
    if (
      !betAmt ||
      betAmt <= 0 ||
      user.totalChips < betAmt ||
      !Number.isInteger(betAmt)
    )
      return NextResponse.json({ message: "Invalid bet" }, { status: 400 });
    if (user.activeBlackjack)
      return NextResponse.json(
        { message: "Active game exists" },
        { status: 409 },
      );

    const serverSeed = crypto.randomBytes(32).toString("hex");
    const serverSeedHash = sha256(serverSeed);
    const deck = shuffle(generateDeck(), serverSeed);

    const game: BlackjackGame = {
      gameId: crypto.randomUUID(),
      betAmt,
      hands: [
        { cards: [deck.pop()!, deck.pop()!], finished: false, bet: betAmt },
      ],
      dealerHand: [deck.pop()!, deck.pop()!],
      activeHandIndex: 0,
      deck,
      startCount: user.totalChips,
      finished: false,
      serverSeedHash,
      serverSeed,
      createdAt: Date.now(),
      version: "blackjack_v2",
    };

    await users.updateOne(
      { id: clerkUser.id },
      { $set: { activeBlackjack: game } },
    );
    return NextResponse.json({
      gameId: game.gameId,
      playerHand: game.hands[0].cards,
      dealerUpCard: game.dealerHand[0],
      serverSeedHash,
    });
  }

  const game = user.activeBlackjack;
  if (!game || game.finished)
    return NextResponse.json({ message: "No active game" }, { status: 400 });
  const hand = game.hands[game.activeHandIndex];

  if (action === "hit") {
    hand.cards.push(game.deck.pop()!);
    if (handValue(hand.cards) > 21) hand.finished = true;
  } else if (action === "double") {
    if (
      hand.cards.length !== 2 ||
      user.totalChips < hand.bet * 2 ||
      game.hands.length > 1
    )
      return NextResponse.json(
        { message: "Double not allowed" },
        { status: 400 },
      );
    hand.bet *= 2;
    hand.doubled = true;
    hand.cards.push(game.deck.pop()!);
    hand.finished = true;
  } else if (action === "split") {
    if (
      hand.cards.length !== 2 ||
      hand.cards[0].rank !== hand.cards[1].rank ||
      user.totalChips < hand.bet * 2
    )
      return NextResponse.json(
        { message: "Split not allowed" },
        { status: 400 },
      );
    const [c1, c2] = hand.cards;
    game.hands.splice(
      game.activeHandIndex,
      1,
      { cards: [c1, game.deck.pop()!], finished: false, bet: hand.bet },
      { cards: [c2, game.deck.pop()!], finished: false, bet: hand.bet },
    );
  }

  if (action === "stand" || hand.finished) {
    hand.finished = true;
    if (game.activeHandIndex < game.hands.length - 1) {
      game.activeHandIndex++;
      await users.updateOne(
        { id: clerkUser.id },
        { $set: { activeBlackjack: game } },
      );
      return NextResponse.json({ nextHand: true });
    } else {
      while (handValue(game.dealerHand) < 17)
        game.dealerHand.push(game.deck.pop()!);
      const dealerTotal = handValue(game.dealerHand);
      const resolvedHands: ResolvedHand[] = [];
      let netChange = 0;

      for (const h of game.hands) {
        const playerTotal = handValue(h.cards);
        const isBJ = h.cards.length === 2 && playerTotal === 21 && !h.doubled;
        let outcome: BlackjackHandOutcome;
        if (playerTotal > 21) {
          outcome = "bust";
          netChange -= h.bet;
        } else if (isBJ && dealerTotal !== 21) {
          outcome = "blackjack";
          netChange += Math.floor(h.bet * 1.5);
        } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
          outcome = "win";
          netChange += h.bet;
        } else if (playerTotal < dealerTotal) {
          outcome = "lose";
          netChange -= h.bet;
        } else {
          outcome = "push";
        }
        resolvedHands.push({
          cards: h.cards,
          outcome,
          betAmt: h.bet,
          doubled: !!h.doubled,
        });
      }

      const endCount = Math.max(0, game.startCount + netChange);
      const endTime = Date.now();

      let gameOutcome: "win" | "lose" | "push" | "blackjack" = "lose";
      if (netChange > 0) {
        gameOutcome = resolvedHands.some((h) => h.outcome === "blackjack")
          ? "blackjack"
          : "win";
      } else if (netChange === 0) {
        gameOutcome = "push";
      }

      const generalHistory: GeneralHistory = {
        userId: clerkUser.id,
        type: "blackjack",
        betAmt: game.betAmt,
        startCount: game.startCount,
        endCount,
        change: netChange,
        date: endTime,
        actor: "user",
        version: "genHistory_v1",
        blackjackData: {
          gameId: game.gameId,
          outcome: gameOutcome,
        },
      };

      await Promise.all([
        historyColl.insertOne(generalHistory),
        users.updateOne(
          { id: clerkUser.id },
          {
            $set: { totalChips: endCount },
            $unset: { activeBlackjack: "" },
            $inc: {
              blackjackCount: 1,
              historyCount: 1,
              blackjackProfit: netChange,
            },
          },
        ),
      ]);

      return NextResponse.json({
        dealerHand: game.dealerHand,
        finalHands: resolvedHands,
        updatedChips: endCount,
        serverSeedHash: game.serverSeedHash,
        serverSeed: game.serverSeed,
      });
    }
  }

  await users.updateOne(
    { id: clerkUser.id },
    { $set: { activeBlackjack: game } },
  );
  return NextResponse.json({ playerHand: hand.cards, finished: hand.finished });
}
