"use client";

import { PrimaryButton, SecondaryButton } from "@/components/ui/global/buttons";
import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { useChips } from "@/components/providers";
import { PiPokerChip } from "react-icons/pi";
import ElasticSlider from "@/components/ElasticSlider";
import { MinesAction } from "@/lib/types";
import React from "react";
import ControlledTile from "@/components/ui/games/mines/controlled-tile";
import clsx from "clsx";

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

  const containerRef = useRef(null);

  const { chips, chipsFetched } = useChips();

  const gridNumsArr = Array.from({ length: 5 }).map(() => [0, 1, 2, 3, 4]);

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
          "An error occurred"
      );
    } else {
      setLoading(false);
      setMessage("");
      if (action.type == "start" || action.type == "resume") {
        setFlippedTiles(json.flippedTiles);
        setGameActive(true);
        setSidebarExpanded(false);
        if (
          json.flippedTiles.some(
            (t: { value: "safe" | "mine" }) => t.value === "mine"
          )
        ) {
          setGameActive(false);
        }
        if (json.multiplier) {
          setMultiplier(json.multiplier);
          setCashOutValue(
            action.type == "start"
              ? json.betAmt * json.multiplier
              : json.betAmt *
                  json.multiplier *
                  (json.flippedTiles.length / (json.flippedTiles.length - 1))
          );
        }
      } else if (action.type == "flip") {
        setFlippedTiles(json.flippedTiles);
        if (json.multiplier) {
          setMultiplier(json.multiplier);
          setCashOutValue(
            json.betAmt *
              json.multiplier
          );
        }

        if (json.gameOver) {
          setGameActive(false);
          setCashOutValue(0);
        }
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
  }, []);

  function handleFlip(row: number, col: number) {
    sendAction({ type: "flip", info: { tileCoordinates: [row, col] } });
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
          <div className="flex flex-col h-full items-center">
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
                /{chips}
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
            <div className="flex flex-col mt-3 w-full justify-center items-center">
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
                disabled={!gameActive || loading}
              />
              <p className="text-left pl-4">
                {multiplier && `Multiplier: ${multiplier.toFixed(5)}`}
              </p>
            </motion.div>
            <div className="flex justify-center items-center w-full flex-1">
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
                            t.coordinates[1] === colIndex
                        );

                        return (
                          <ControlledTile
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

                  <p className="mt-2 text-4xl font-bold">Coming Soon!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
