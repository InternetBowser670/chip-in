"use client";

import { PrimaryButton, SecondaryButton } from "@/components/ui/global/buttons";
import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useChips } from "@/components/providers";
import { PiPokerChip } from "react-icons/pi";
import ElasticSlider from "@/components/ElasticSlider";
import { MinesAction } from "@/lib/types";
import ControlledTile from "@/components/ui/games/mines/controlled-tile";
import clsx from "clsx";
import queue from "queue";

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

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={containerRef}
        className="h-[80%] w-[90%] bg-gray-800 rounded-2xl text-center overflow-auto flex"
      >
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: !sidebarExpanded ? "30%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`h-full p-4 rounded-r-2xl bg-background-700 ${
            sidebarExpanded ? "w-full" : "w-16"
          }`}
        >
          <div className="flex flex-col items-center h-full">
            <h1 className="mx-2 mb-10 text-5xl font-bold">Mines</h1>
            <div
              className={`bg-black border-2 border-white rounded-2xl transition-colors duration-500 xl:h-8 max-w-125 flex flex-col xl:flex-row items-center justify-between overflow-hidden ${
                betAmt && chipsFetched && betAmt > chips
                  ? "bg-red-600"
                  : "bg-black"
              }`}
            >
              <div className="flex items-center w-full pr-2 xl:w-auto xl:pr-0">
                <input
                  className={`focus:outline-0 text-white h-full pl-2 shrink min-w-0 ${
                    betAmt == 0 && "text-red-600!"
                  }`}
                  title="bet"
                  value={betAmt || ""}
                  onChange={(e) => setBetAmt(parseInt(e.target.value) || null)}
                  placeholder="Bet Amount"
                  type="text"
                />
              </div>

              <div className="flex items-center justify-end w-full h-full p-0 m-0 border-t-2 border-white xl:w-auto xl:border-t-0">
                <PiPokerChip className="inline ml-2!" size={24} />
                <button
                  type="button"
                  className="h-full! bg-background-600 px-2 ml-2! flex items-center justify-center text-center border-l-white border-l-2"
                  onClick={() => setBetAmt(betAmt && betAmt * 2)}
                >
                  x2
                </button>
                <button
                  type="button"
                  className="h-full! bg-background-600 px-2 border-x-white border-x-2"
                  onClick={() => setBetAmt(betAmt && betAmt / 2)}
                >
                  /2
                </button>
                <button
                  type="button"
                  className="h-full! bg-background-600 px-2"
                  onClick={() => setBetAmt(chips)}
                >
                  All
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full mt-3">
              Mine Count:{" "}
              <ElasticSlider
                className="mt-3 text-gray-50"
                value={minesCount}
                startingValue={1}
                maxValue={24}
                onChange={(val) => setMinesCount(Math.round(val))}
              />
            </div>
            <motion.div className={clsx(!sidebarExpanded && "w-90%")}>
              <PrimaryButton
                onClick={startGame}
                className={"w-full"}
                disabled={gameActive || loading}
                text="Start Game"
              />
              <SecondaryButton
                className={"w-full"}
                text={
                  cashOutValue
                    ? `Cash Out ${cashOutValue.toFixed(2)}`
                    : "Cash Out"
                }
                onClick={cashOut}
                disabled={!gameActive || loading || !canCashOut}
              />
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
