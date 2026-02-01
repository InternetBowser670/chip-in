import {
  ChipInUser,
  MinesAction,
  MinesGame,
  MinesGrid,
  MinesRow,
  GeneralHistory,
} from "@/lib/types";
import { connectToDatabases } from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 } from "uuid";
import crypto from "crypto";
import {
  calculateMinesMultiplier,
  calculateMinesProbability,
} from "@/lib/games/mines";

export const dynamic = "force-dynamic";

type TileValue = "mine" | "safe";
type FlippedTile = { coordinates: [number, number]; value: TileValue };

function hashToFloat(seed: string, index: number): number {
  const hash = crypto.createHash("sha256").update(`${seed}:${index}`).digest("hex");
  return parseInt(hash.slice(0, 13), 16) / 0xfffffffffffff;
}

function generateProvablyFairGrid(minesCount: number, serverSeed: string, clientSeed: string, nonce: number): MinesGrid {
  const seed = `${serverSeed}:${clientSeed}:${nonce}`;
  const rolls: { index: number; roll: number }[] = [];
  for (let i = 0; i < 25; i++) rolls.push({ index: i, roll: hashToFloat(seed, i) });
  rolls.sort((a, b) => a.roll - b.roll);
  const mineSet = new Set(rolls.slice(0, minesCount).map((r) => r.index));
  const grid: MinesGrid = [];
  for (let r = 0; r < 5; r++) {
    const row: MinesRow = [];
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      row.push({ value: mineSet.has(idx) ? "mine" : "safe", revealed: false });
    }
    grid.push(row);
  }
  return grid;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body as { action: MinesAction };
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection<ChipInUser>("users");
  const historyColl = mainDb.collection<GeneralHistory>("history");

  const user = await users.findOne({ id: clerkUser.id }, {
    projection: { id: 1, totalChips: 1, activeMinesGame: 1, minesCount: 1, historyCount: 1, minesProfit: 1 }
  });
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  if (action.type === "resume") {
    const game = user.activeMinesGame;
    if (!game || game.finished) return NextResponse.json({ message: "No active game to resume" }, { status: 400 });
    return NextResponse.json({
      flippedTiles: game.tilesFlipped,
      minesCount: game.minesCount,
      betAmt: game.betAmt,
      multiplier: calculateMinesMultiplier(calculateMinesProbability(game.minesCount, game.tilesFlippedCount)),
      fairness: { serverSeedHash: game.fairness.serverSeedHash, clientSeed: game.fairness.clientSeed, nonce: game.fairness.nonce },
    });
  }

  if (action.type === "start") {
    if (user.activeMinesGame && !user.activeMinesGame.finished) {
      return NextResponse.json({
        flippedTiles: user.activeMinesGame.tilesFlipped,
        message: "Game resumed",
        minesCount: user.activeMinesGame.minesCount,
        betAmt: user.activeMinesGame.betAmt,
        fairness: {
          serverSeedHash: user.activeMinesGame.fairness.serverSeedHash,
          clientSeed: user.activeMinesGame.fairness.clientSeed,
          nonce: user.activeMinesGame.fairness.nonce,
        },
      });
    }

    const { betAmt, minesCount, clientSeed = "default" } = action.info;
    if (!betAmt || betAmt <= 0 || !Number.isInteger(betAmt) || betAmt > user.totalChips) 
        return NextResponse.json({ message: "Invalid bet amount" }, { status: 400 });
    if (minesCount < 1 || minesCount > 24 || !Number.isInteger(minesCount))
        return NextResponse.json({ message: "Invalid mines count" }, { status: 400 });
    
    const serverSeed = crypto.randomBytes(32).toString("hex");
    const serverSeedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");
    const grid = generateProvablyFairGrid(minesCount, serverSeed, clientSeed, 0);

    const game: MinesGame = {
      gameId: v4(), betAmt, minesCount, grid, finished: false, startCount: user.totalChips,
      createdAt: Date.now(), tilesFlippedCount: 0, tilesFlipped: [],
      fairness: { serverSeedHash, serverSeed, clientSeed, nonce: 0 },
    };

    const reducedChips = user.totalChips - betAmt;
    await users.updateOne({ id: clerkUser.id }, { $set: { activeMinesGame: game, totalChips: reducedChips } });

    return NextResponse.json({
      flippedTiles: [], betAmt, minesCount, reducedChips,
      multiplier: calculateMinesMultiplier(calculateMinesProbability(minesCount, 0)),
      fairness: { serverSeedHash, clientSeed, nonce: 0 },
    });
  }

  const game = user.activeMinesGame;
  if (!game || game.finished) return NextResponse.json({ message: "No active game" }, { status: 400 });

  if (action.type === "flip") {
    const [row, col] = action.info.tileCoordinates;
    const tile = game.grid[row][col];
    if (tile.revealed) return NextResponse.json({ message: "Tile already revealed" }, { status: 400 });

    tile.revealed = true;
    const isMine = tile.value === "mine";
    
    const flippedTiles: FlippedTile[] = isMine 
        ? game.grid.flatMap((r, rIdx) => r.map((t, cIdx) => ({ coordinates: [rIdx, cIdx] as [number, number], value: t.value as TileValue })))
        : [...game.tilesFlipped, { coordinates: [row, col], value: tile.value as TileValue }];

    if (isMine) {
      const netChange = -game.betAmt;
      const historyDoc: GeneralHistory = {
        userId: clerkUser.id, type: "mines", betAmt: game.betAmt, startCount: game.startCount,
        endCount: user.totalChips, change: netChange, date: Date.now(), actor: "user", version: "genHistory_v1",
        minesData: { 
            gameId: game.gameId, minesCount: game.minesCount, grid: game.grid, 
            tilesFlippedCount: game.tilesFlippedCount + 1, tilesFlipped: flippedTiles, 
            finalMultiplier: 0, fairness: { serverSeed: game.fairness.serverSeed!, clientSeed: game.fairness.clientSeed, nonce: game.fairness.nonce } 
        }
      };

      await Promise.all([
        historyColl.insertOne(historyDoc),
        users.updateOne({ id: clerkUser.id }, { 
            $unset: { activeMinesGame: "" }, 
            $inc: { minesCount: 1, historyCount: 1, minesProfit: netChange } 
        })
      ]);

      return NextResponse.json({
        flippedTiles, gameOver: true, endCount: user.totalChips,
        fairness: { serverSeed: game.fairness.serverSeed, clientSeed: game.fairness.clientSeed, nonce: game.fairness.nonce }
      });
    }

    game.tilesFlipped = flippedTiles;
    game.tilesFlippedCount++;
    await users.updateOne({ id: clerkUser.id }, { $set: { activeMinesGame: game } });

    return NextResponse.json({
      flippedTiles, gameOver: false, betAmt: game.betAmt,
      multiplier: calculateMinesMultiplier(calculateMinesProbability(game.minesCount, game.tilesFlippedCount)),
    });
  }

  if (action.type === "cashout") {
    const mult = calculateMinesMultiplier(calculateMinesProbability(game.minesCount, game.tilesFlippedCount));
    const winAmt = Math.floor(game.betAmt * mult);
    const netChange = winAmt - game.betAmt;
    const endCount = user.totalChips + winAmt;

    const fullFlippedTiles: FlippedTile[] = game.grid.flatMap((r, rIdx) => 
      r.map((t, cIdx) => ({ coordinates: [rIdx, cIdx] as [number, number], value: t.value as TileValue }))
    );

    const historyDoc: GeneralHistory = {
      userId: clerkUser.id, type: "mines", betAmt: game.betAmt, startCount: game.startCount,
      endCount, change: netChange, date: Date.now(), actor: "user", version: "genHistory_v1",
      minesData: { 
          gameId: game.gameId, minesCount: game.minesCount, grid: game.grid, 
          tilesFlippedCount: game.tilesFlippedCount, tilesFlipped: game.tilesFlipped, 
          finalMultiplier: mult, fairness: { serverSeed: game.fairness.serverSeed!, clientSeed: game.fairness.clientSeed, nonce: game.fairness.nonce } 
      }
    };

    await Promise.all([
      historyColl.insertOne(historyDoc),
      users.updateOne({ id: clerkUser.id }, { 
          $set: { totalChips: endCount }, 
          $unset: { activeMinesGame: "" }, 
          $inc: { minesCount: 1, historyCount: 1, minesProfit: netChange } 
      })
    ]);

    return NextResponse.json({ 
        success: true, 
        winAmt, 
        endCount, 
        flippedTiles: fullFlippedTiles, 
        fairness: { serverSeed: game.fairness.serverSeed, clientSeed: game.fairness.clientSeed, nonce: game.fairness.nonce } 
    });
  }
}
