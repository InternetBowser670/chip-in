"use client";

import { PrimaryButton } from "@/components/ui/global/buttons";
import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import MinesTile from "@/components/ui/games/mines/tile";
import { useChips } from "@/components/providers";
import { PiPokerChip } from "react-icons/pi";
import ElasticSlider from "@/components/ElasticSlider";
import { MinesAction, MinesGrid } from "@/lib/types";
import React from "react";

export default function MinesPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mineState, setMineState] = useState<false | "safe" | "mine">(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [betAmt, setBetAmt] = useState<number | null>(null);
  const [grid, setGrid] = useState<MinesGrid | null>(null);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [gameActive, setGameActive] = useState<boolean>(false);

  const containerRef = useRef(null);

  const { chips, chipsFetched } = useChips();

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
      return alert(
        (json.message && "An error occurred" + json.message) ||
          "An error occurred"
      );
    } else {
      if (action.type == "start") {
        setGrid(json.grid);
        setGameActive(true);
        setSidebarExpanded(false);
      }
    }
  }

  function startGame() {
    if (!betAmt || betAmt <= 0 || !Number.isInteger(betAmt) || betAmt > chips) {
      return alert("Invalid bet amount");
    }

    if (minesCount < 1 || minesCount > 24 || !Number.isInteger(minesCount)) {
      return alert("Invalid mines count");
    }

    sendAction({ type: "start", info: { betAmt, minesCount: 3 } });
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
                onChange={setMinesCount}
              />
            </div>
            <PrimaryButton
              onClick={startGame}
              disabled={gameActive}
              text="Start Game"
            />
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
                  {grid?.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      <div className="flex">
                        {row.map((tile, colIndex) => (
                          <React.Fragment key={colIndex}>
                            <button
                              type="button"
                              className="m-2"
                              onClick={() =>
                                setMineState(
                                  mineState == "safe"
                                    ? "mine"
                                    : mineState == "mine"
                                    ? false
                                    : "safe"
                                )
                              }
                            >
                              <MinesTile
                                flipped={mineState == false ? false : true}
                                value={
                                  mineState !== false ? mineState : undefined
                                }
                              />
                            </button>
                          </React.Fragment>
                        ))}
                      </div>
                    </React.Fragment>
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
