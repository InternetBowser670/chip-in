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

export async function POST(req: Request) {
  const body = await req.json();

  const { action } = body as { action: MinesAction };

  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { mainDb } = await connectToDatabases(false);

  const users = mainDb.collection<ChipInUser>("users");

  const user = await users.findOne({ id: clerkUser.id });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  function generateMinesGrid(minesCount: number): MinesGrid {
    const tilesArray: MinesGrid = [];
    const mineIndices = new Set<number>();

    while (mineIndices.size < minesCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }

    for (let i = 0; i < 5; i++) {
      const minesRow: MinesRow = [];
      for (let j = 0; j < 5; j++) {
        const currentIndex = i * 5 + j;
        const type = mineIndices.has(currentIndex) ? "mine" : "safe";

        minesRow.push({ value: type, revealed: false });
      }
      tilesArray.push(minesRow);
    }
    return tilesArray;
  }

  if (action.type === "start") {
    if (user.activeMinesGame && !user.activeMinesGame.finished) {
      return NextResponse.json({
        flippedTiles: user.activeMinesGame.tilesFlipped,
        message: "Game resumed",
        minesCount: user.activeMinesGame.minesCount,
        betAmt: user.activeMinesGame.betAmt,
      });
    }

    const betAmt = action.info.betAmt;

    if (
      !betAmt ||
      betAmt <= 0 ||
      user.totalChips < betAmt ||
      !Number.isInteger(betAmt)
    ) {
      return NextResponse.json(
        { message: "Invalid bet amount" },
        { status: 400 }
      );
    }

    const minesCount = action.info.minesCount;

    if (minesCount < 1 || minesCount > 24 || !Number.isInteger(minesCount)) {
      return NextResponse.json(
        { message: "Invalid mines count" },
        { status: 400 }
      );
    }

    const grid = generateMinesGrid(minesCount);

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
    };

    await users.updateOne(
      { id: clerkUser.id },
      { $set: { activeMinesGame: game } }
    );

    return NextResponse.json({
      flippedTiles: [],
      betAmt,
      minesCount,
    });
  } else if (action.type === "flip") {
    if (!user.activeMinesGame || user.activeMinesGame.finished) {
      return NextResponse.json(
        { message: "No active game to flip tile in" },
        { status: 400 }
      );
    }

    const game = user.activeMinesGame;
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

    let flippedTiles: FlippedTile[];

    if (isMine) {
      flippedTiles = newGrid.flatMap((r, rowIndex) =>
        r.map(
          (t, colIndex): FlippedTile => ({
            coordinates: [rowIndex, colIndex],
            value: t.value as TileValue,
          })
        )
      );
    } else {
      flippedTiles = [
        ...game.tilesFlipped,
        {
          coordinates: [row, col],
          value: tile.value as TileValue,
        },
      ];
    }

    const updatedGame = {
      ...game,
      grid: newGrid,
      finished: isMine,
      tilesFlipped: flippedTiles,
      tilesFlippedCount: game.tilesFlippedCount + 1,
    };

    await users.updateOne(
      { id: clerkUser.id },
      { $set: { activeMinesGame: updatedGame } }
    );

    if (isMine) {
      await users.updateOne(
        { id: clerkUser.id },
        { $unset: { activeMinesGame: "" } }
      );

      const endTime = Date.now();
      const endCount = user.totalChips - game.betAmt;
      const netChange = endCount - updatedGame.startCount;

      const history: UserHistory = {
        betAmt: updatedGame.betAmt,
        startCount: updatedGame.startCount,
        endCount,
        change: netChange,
        date: endTime,
        type: "mines_v1",
        version: "mines_v1",
        actor: "user",
        minesData: {
          gameId: updatedGame.gameId,
          minesCount: updatedGame.minesCount,
          grid: updatedGame.grid,
          tilesFlippedCount: updatedGame.tilesFlippedCount,
          tilesFlipped: updatedGame.tilesFlipped,
          finalMultiplier: calculateMinesMultiplier(
            calculateMinesProbability(
              updatedGame.minesCount,
              updatedGame.tilesFlippedCount
            )
          ),
        },
      };

      await users.updateOne(
        { id: clerkUser.id },
        {
          $set: { totalChips: endCount },
          $push: {
            minesPlays: history as UserHistory,
            history: history as UserHistory,
          },
        }
      );

      return NextResponse.json({
        flippedTiles,
        gameOver: isMine,
        betAmt: game.betAmt,
        multiplier: isMine
          ? null
          : calculateMinesMultiplier(
              calculateMinesProbability(
                game.minesCount,
                updatedGame.tilesFlippedCount
              )
            ),
        message: isMine ? "Game over!" : undefined,
        endCount: endCount,
      });
    }

    return NextResponse.json({
      flippedTiles,
      gameOver: isMine,
      betAmt: game.betAmt,
      multiplier: isMine
        ? null
        : calculateMinesMultiplier(
            calculateMinesProbability(
              game.minesCount,
              updatedGame.tilesFlippedCount
            )
          ),
      message: isMine ? "Game over!" : undefined,
    });
  } else if (action.type === "cashout") {
    if (!user.activeMinesGame || user.activeMinesGame.finished) {
      return NextResponse.json(
        { message: "No active game to resume" },
        { status: 400 }
      );
    }

    const game = user.activeMinesGame;

    const probability = calculateMinesProbability(
      game.minesCount,
      game.tilesFlippedCount
    );
    const multiplier = calculateMinesMultiplier(probability);
    const winnings = game.betAmt * multiplier;

    const flippedTiles: FlippedTile[] = game.grid.flatMap((r, rowIndex) =>
      r.map(
        (t, colIndex): FlippedTile => ({
          coordinates: [rowIndex, colIndex],
          value: t.value as TileValue,
        })
      )
    );

    const endTime = Date.now();
    const endCount = user.totalChips + winnings;
    const netChange = endCount - game.startCount;

    const history: UserHistory = {
      betAmt: game.betAmt,
      startCount: game.startCount,
      endCount,
      change: netChange,
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
        finalMultiplier: calculateMinesMultiplier(
          calculateMinesProbability(game.minesCount, game.tilesFlippedCount)
        ),
      },
    };

    await users.updateOne(
      { id: clerkUser.id },
      {
        $set: { totalChips: user.totalChips + winnings },
        $push: {
          minesPlays: history as UserHistory,
          history: history as UserHistory,
        },
      }
    );

    await users.updateOne(
      { id: clerkUser.id },
      { $unset: { activeMinesGame: "" } }
    );

    return NextResponse.json({
      message: `You cashed out and won ${winnings.toFixed(2)} chips!`,
      winnings,
      flippedTiles,
      endChips: user.totalChips + winnings,
    });
  } else if (action.type === "resume") {
    if (!user.activeMinesGame || user.activeMinesGame.finished) {
      return NextResponse.json(
        { message: "No active game to resume" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      flippedTiles: user.activeMinesGame.tilesFlipped,
      message: "Game resumed",
      minesCount: user.activeMinesGame.minesCount,
      betAmt: user.activeMinesGame.betAmt,
      multiplier: calculateMinesMultiplier(
        calculateMinesProbability(
          user.activeMinesGame.minesCount,
          user.activeMinesGame.tilesFlippedCount
        )
      ),
    });
  }
  return NextResponse.json({ message: "Invalid action type" }, { status: 400 });
}
