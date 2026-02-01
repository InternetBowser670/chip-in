"use client";

import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useChips } from "@/components/providers";
import { PiPokerChip } from "react-icons/pi";
import { Slider } from "@/components/ui/slider";
import { MinesAction } from "@/lib/types";
import ControlledTile from "@/components/ui/games/mines/controlled-tile";
import clsx from "clsx";
import queue from "queue";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function MinesPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [betAmt, setBetAmt] = useState<number | null>(null);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Loading...");
  const [loading, setLoading] = useState<boolean>(true);
  const [flippedTiles, setFlippedTiles] = useState<
    { coordinates: [number, number]; value: "safe" | "mine" }[]
  >([]);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [cashOutValue, setCashOutValue] = useState<number>(0);
  const [canCashOut, setCanCashOut] = useState<boolean>(false);

  const containerRef = useRef(null);

  const { chips, chipsFetched, setChips } = useChips();

  const gridNumsArr = Array.from({ length: 5 }).map(() => [0, 1, 2, 3, 4]);

  type QueuedFlip = {
    id: string;
    row: number;
    col: number;
  };

  const queuedFlipsRef = useRef<QueuedFlip[]>([]);

  const qRef = useRef<queue | null>(null);

  if (!qRef.current) {
    qRef.current = new queue({ concurrency: 1, autostart: true });
  }

  const q = qRef.current;

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  async function sendAction(action: MinesAction) {
    const res = await fetch("/api/games/mines", {
      method: "POST",
      body: JSON.stringify({ action }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (
        action.type == "resume" &&
        json.message === "No active game to resume"
      ) {
        setMessage("Place your bet to start a new game!");
        return setLoading(false);
      }

      return setMessage(
        (json.message && "An error occurred: " + json.message) ||
          "An error occurred",
      );
    } else {
      setLoading(false);
      setMessage("");
      if (action.type == "start" || action.type == "resume") {
        setFlippedTiles(json.flippedTiles);
        setGameActive(true);
        setSidebarExpanded(false);
        setFlippedTiles(json.flippedTiles);
        if (
          json.flippedTiles.some(
            (t: { value: "safe" | "mine" }) => t.value === "mine",
          )
        ) {
          setGameActive(false);
        }
        if (json.multiplier) {
          setMultiplier(json.multiplier);
          setCashOutValue(
            action.type == "start"
              ? json.betAmt * json.multiplier
              : json.betAmt * json.multiplier,
          );
        }
        if (json.reducedChips !== undefined) {
          setChips(json.reducedChips);
        }
        setCanCashOut(true);
      } else if (action.type == "flip") {
        setFlippedTiles((prev) => {
          const map = new Map(
            prev.map((t) => [`${t.coordinates[0]}-${t.coordinates[1]}`, t]),
          );

          for (const t of json.flippedTiles) {
            map.set(`${t.coordinates[0]}-${t.coordinates[1]}`, t);
          }

          return Array.from(map.values());
        });
        if (json.multiplier) {
          setMultiplier(json.multiplier);
          setCashOutValue(json.betAmt * json.multiplier);
        }

        if (json.gameOver) {
          q.end();
          queuedFlipsRef.current = [];
          setGameActive(false);
          setCashOutValue(0);
          setChips(json.endCount);
        }
      } else if (action.type == "cashout") {
        setGameActive(false);
        setChips(json.endCount);
        setFlippedTiles(json.flippedTiles);
      }
      if (json.message) {
        setMessage(json.message);
      }
    }
  }

  function startGame() {
    if (!betAmt || betAmt <= 0 || !Number.isInteger(betAmt) || betAmt > chips) {
      return alert("Invalid bet amount");
    }

    if (minesCount < 1 || minesCount > 24 || !Number.isInteger(minesCount)) {
      return alert("Invalid mines count: " + minesCount);
    }

    sendAction({ type: "start", info: { betAmt, minesCount } });
  }

  useEffect(() => {
    sendAction({ type: "resume" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFlip(row: number, col: number) {
    const alreadyQueued = queuedFlipsRef.current.some(
      (f) => f.row === row && f.col === col,
    );

    if (alreadyQueued) return;
    const flip: QueuedFlip = {
      id: crypto.randomUUID(),
      row,
      col,
    };

    queuedFlipsRef.current.push(flip);

    q.push(async () => {
      try {
        await sendAction({
          type: "flip",
          info: { tileCoordinates: [row, col] },
        });
      } finally {
        queuedFlipsRef.current = queuedFlipsRef.current.filter(
          (f) => f.id !== flip.id,
        );
      }
    });
  }

  function cashOut() {
    sendAction({ type: "cashout" });
  }

  function setMines(val: number[]) {
    setMinesCount(Math.round(val[0]));
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={containerRef}
        className="h-[80%] w-[90%] bg-background rounded-2xl text-center overflow-auto flex border"
      >
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: !sidebarExpanded ? "30%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`h-full p-4 rounded-r-2xl bg-card border-r ${
            sidebarExpanded ? "w-full" : "w-16"
          }`}
        >
          <div className="flex flex-col items-center h-full">
            <h1 className="mx-2 mb-10 text-5xl font-bold">Mines</h1>
            <motion.div
              className="flex justify-center mt-6"
              initial={{ width: "40%" }}
              animate={{ width: !sidebarExpanded ? "100%" : "40%" }}
            >
              <Field
                className="flex flex-row justify-center w-full"
                data-invalid={
                  chipsFetched &&
                  betAmt &&
                  (betAmt > chips || betAmt < 0 || !Number.isInteger(betAmt))
                }
              >
                <InputGroup>
                  <InputGroupInput
                    title="bet"
                    value={betAmt || ""}
                    onChange={(e) =>
                      setBetAmt(parseInt(e.target.value) || null)
                    }
                    placeholder="Bet Amount"
                    type="text"
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <PiPokerChip />
                    <InputGroupButton
                      variant={"outline"}
                      className="flex items-center justify-center text-center text-foreground"
                      onClick={() => setBetAmt(betAmt && betAmt * 2)}
                    >
                      x2
                    </InputGroupButton>
                    <InputGroupButton
                      variant={"outline"}
                      className="flex items-center justify-center text-center text-foreground"
                      onClick={() => setBetAmt(betAmt && betAmt / 2)}
                    >
                      /2
                    </InputGroupButton>
                    <InputGroupButton
                      variant={"outline"}
                      className="flex items-center justify-center text-center text-foreground"
                      onClick={() => setBetAmt(Math.floor(chips))}
                    >
                      All In
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </motion.div>
            <motion.div
              className={clsx(
                "flex flex-col items-center justify-center w-full mt-3",
              )}
              initial={{ width: "50%" }}
              animate={{ width: sidebarExpanded ? "50%" : "100%" }}
            >
              Mine Count: {minesCount}
              <Slider
                className="mt-3 text-gray-50"
                defaultValue={[minesCount]}
                min={1}
                max={24}
                onValueChange={setMines}
              />
            </motion.div>
            <motion.div className={clsx(!sidebarExpanded && "w-90%")}>
              <Button
                onClick={startGame}
                className={"w-full my-4"}
                disabled={gameActive || loading}
              >
                {sidebarExpanded ? "Start Game" : "Restart Game"}
              </Button>
              <Button
                variant={"secondary"}
                className={"w-full mb-4"}
                onClick={cashOut}
                disabled={!gameActive || loading || !canCashOut}
              >
                {cashOutValue
                  ? `Cash Out ${cashOutValue.toFixed(2)}`
                  : "Cash Out"}
              </Button>
              <p className="pl-4 text-left">
                {multiplier && `Multiplier: ${multiplier.toFixed(5)}`}
              </p>
            </motion.div>
            <div className="flex items-center justify-center flex-1 w-full">
              <h2 className="text-2xl font-bold">{message}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: !sidebarExpanded ? "70%" : "0%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex items-center justify-center flex-1 h-full overflow-hidden"
        >
          <div
            className="h-full"
            style={{
              width: (containerWidth * 7) / 10,
              minWidth: (containerWidth * 7) / 10,
            }}
          >
            <div className="relative flex flex-1 h-full overflow-hidden">
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-center">
                  {gridNumsArr.map((row, rowIndex) => (
                    <div className="flex" key={rowIndex}>
                      {row.map((colIndex) => {
                        const flipped = flippedTiles.find(
                          (t) =>
                            t.coordinates[0] === rowIndex &&
                            t.coordinates[1] === colIndex,
                        );

                        return (
                          <ControlledTile
                            queued={queuedFlipsRef.current.some(
                              (f) => f.row === rowIndex && f.col === colIndex,
                            )}
                            key={`${rowIndex}-${colIndex}`}
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                            revealed={!!flipped}
                            value={flipped?.value}
                            onFlip={handleFlip}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
