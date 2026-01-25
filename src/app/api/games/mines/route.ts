import {
  ChipInUser,
  MinesAction,
  MinesGame,
  MinesGrid,
  MinesRow,
  UserHistory,
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

type FlippedTile = {
  coordinates: [number, number];
  value: TileValue;
};

function hashToFloat(seed: string, index: number): number {
  const hash = crypto
    .createHash("sha256")
    .update(`${seed}:${index}`)
    .digest("hex");
  return parseInt(hash.slice(0, 13), 16) / 0xfffffffffffff;
}

function generateProvablyFairGrid(
  minesCount: number,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): MinesGrid {
  const seed = `${serverSeed}:${clientSeed}:${nonce}`;
  const rolls: { index: number; roll: number }[] = [];

  for (let i = 0; i < 25; i++) {
    rolls.push({ index: i, roll: hashToFloat(seed, i) });
  }

  rolls.sort((a, b) => a.roll - b.roll);

  const mineSet = new Set(rolls.slice(0, minesCount).map((r) => r.index));
  const grid: MinesGrid = [];

  for (let r = 0; r < 5; r++) {
    const row: MinesRow = [];
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      row.push({
        value: mineSet.has(idx) ? "mine" : "safe",
        revealed: false,
      });
    }
    grid.push(row);
  }

  return grid;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action } = body as { action: MinesAction };

  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { mainDb } = await connectToDatabases(false);
  const users = mainDb.collection<ChipInUser>("users");

  const user = await users.findOne({ id: clerkUser.id });
  if (!user)
    return NextResponse.json({ message: "User not found" }, { status: 404 });

  if (action.type === "resume") {
    const game = user.activeMinesGame;
    if (!game || game.finished) {
      return NextResponse.json(
        { message: "No active game to resume" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      flippedTiles: game.tilesFlipped,
      minesCount: game.minesCount,
      betAmt: game.betAmt,
      multiplier: calculateMinesMultiplier(
        calculateMinesProbability(game.minesCount, game.tilesFlippedCount)
      ),
      fairness: {
        serverSeedHash: game.fairness.serverSeedHash,
        clientSeed: game.fairness.clientSeed,
        nonce: game.fairness.nonce,
      },
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

    if (
      !betAmt ||
      betAmt <= 0 ||
      !Number.isInteger(betAmt) ||
      betAmt > user.totalChips
    ) {
      return NextResponse.json(
        { message: "Invalid bet amount" },
        { status: 400 }
      );
    }

    if (minesCount < 1 || minesCount > 24 || !Number.isInteger(minesCount)) {
      return NextResponse.json(
        { message: "Invalid mines count" },
        { status: 400 }
      );
    }

    const serverSeed = crypto.randomBytes(32).toString("hex");
    const serverSeedHash = crypto
      .createHash("sha256")
      .update(serverSeed)
      .digest("hex");

    const grid = generateProvablyFairGrid(
      minesCount,
      serverSeed,
      clientSeed,
      0
    );

    const game: MinesGame = {
      gameId: v4(),
      betAmt,
      minesCount,
      grid,
      finished: false,
      startCount: user.totalChips,
      createdAt: Date.now(),
      tilesFlippedCount: 0,
      tilesFlipped: [],
      fairness: {
        serverSeedHash,
        serverSeed: null,
        clientSeed,
        nonce: 0,
      },
    };

    await users.updateOne(
      { id: clerkUser.id },
      { $set: { activeMinesGame: game } }
    );

    return NextResponse.json({
      flippedTiles: [],
      betAmt,
      minesCount,
      fairness: {
        serverSeedHash,
        clientSeed,
        nonce: 0,
      },
    });
  }

  if (action.type === "flip") {
    const game = user.activeMinesGame;
    if (!game || game.finished) {
      return NextResponse.json({ message: "No active game" }, { status: 400 });
    }

    const [row, col] = action.info.tileCoordinates;
    const tile = game.grid[row][col];
    if (tile.revealed) {
      return NextResponse.json(
        { message: "Tile already revealed" },
        { status: 400 }
      );
    }

    const newGrid = game.grid.map((r, rIdx) =>
      r.map((t, cIdx) =>
        rIdx === row && cIdx === col ? { ...t, revealed: true } : t
      )
    );

    const isMine = tile.value === "mine";

    const flippedTiles: FlippedTile[] = isMine
      ? newGrid.flatMap((r, rIdx) =>
          r.map((t, cIdx) => ({
            coordinates: [rIdx, cIdx],
            value: t.value as TileValue,
          }))
        )
      : [
          ...game.tilesFlipped,
          {
            coordinates: [row, col],
            value: tile.value as TileValue,
          },
        ];

    const updatedGame: MinesGame = {
      ...game,
      grid: newGrid,
      finished: isMine,
      tilesFlipped: flippedTiles,
      tilesFlippedCount: game.tilesFlippedCount + 1,
      fairness: {
        ...game.fairness,
        serverSeed: isMine ? game.fairness.serverSeedHash : null,
      },
    };

    if (isMine) {
      const endTime = Date.now();
      const endCount = user.totalChips - game.betAmt;

      const history: UserHistory = {
        betAmt: game.betAmt,
        startCount: game.startCount,
        endCount,
        change: endCount - game.startCount,
        date: endTime,
        type: "mines_v1",
        version: "mines_v1",
        actor: "user",
        minesData: {
          gameId: game.gameId,
          minesCount: game.minesCount,
          grid: newGrid,
          tilesFlippedCount: updatedGame.tilesFlippedCount,
          tilesFlipped: flippedTiles,
          finalMultiplier: 0,
          fairness: {
            serverSeed: game.fairness.serverSeedHash,
            clientSeed: game.fairness.clientSeed,
            nonce: game.fairness.nonce,
          },
        },
      };

      await users.updateOne(
        { id: clerkUser.id },
        {
          $set: { totalChips: endCount },
          $push: { history, minesPlays: history },
          $unset: { activeMinesGame: "" },
        }
      );

      return NextResponse.json({
        flippedTiles,
        gameOver: true,
        endCount,
        fairness: {
          serverSeed: game.fairness.serverSeedHash,
          clientSeed: game.fairness.clientSeed,
          nonce: game.fairness.nonce,
        },
      });
    }

    await users.updateOne(
      { id: clerkUser.id },
      { $set: { activeMinesGame: updatedGame } }
    );

    return NextResponse.json({
      flippedTiles,
      gameOver: false,
      multiplier: calculateMinesMultiplier(
        calculateMinesProbability(
          game.minesCount,
          updatedGame.tilesFlippedCount
        )
      ),
    });
  }

  if (action.type === "cashout") {
    const game = user.activeMinesGame;
    if (!game || game.finished) {
      return NextResponse.json(
        { message: "No active game to cash out" },
        { status: 400 }
      );
    }

    const probability = calculateMinesProbability(
      game.minesCount,
      game.tilesFlippedCount
    );
    const multiplier = calculateMinesMultiplier(probability);
    const winnings = game.betAmt * multiplier;

    const flippedTiles: FlippedTile[] = game.grid.flatMap((r, rIdx) =>
      r.map((t, cIdx) => ({
        coordinates: [rIdx, cIdx],
        value: t.value as TileValue,
      }))
    );

    const endTime = Date.now();
    const endCount = user.totalChips + winnings;

    const history: UserHistory = {
      betAmt: game.betAmt,
      startCount: game.startCount,
      endCount,
      change: endCount - game.startCount,
      date: endTime,
      type: "mines_v1",
      version: "mines_v1",
      actor: "user",
      minesData: {
        gameId: game.gameId,
        minesCount: game.minesCount,
        grid: game.grid,
        tilesFlippedCount: game.tilesFlippedCount,
        tilesFlipped: game.tilesFlipped,
        finalMultiplier: multiplier,
        fairness: {
          serverSeed: game.fairness.serverSeedHash,
          clientSeed: game.fairness.clientSeed,
          nonce: game.fairness.nonce,
        },
      },
    };

    await users.updateOne(
      { id: clerkUser.id },
      {
        $set: { totalChips: endCount },
        $push: { history, minesPlays: history },
        $unset: { activeMinesGame: "" },
      }
    );

    return NextResponse.json({
      message: `You cashed out and won ${winnings.toFixed(2)} chips!`,
      winnings,
      flippedTiles,
      endCount,
    });
  }

  return NextResponse.json({ message: "Invalid action type" }, { status: 400 });
}
