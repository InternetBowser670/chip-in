"use client";

import { useChips } from "@/components/providers";
import PlayingCard from "@/components/ui/games/any/card";
import { PrimaryButton } from "@/components/ui/global/buttons";
import { BlackjackFinalHand, Card } from "@/lib/types";
import clsx from "clsx";
import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { PiPokerChip } from "react-icons/pi";

export default function BlackjackPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [gameActive, setGameActive] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);
  const [betAmt, setBetAmt] = useState<number | null>(null);
  const [message, setMessage] = useState("Loading game status...");
  const [hands, setHands] = useState<Card[][]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [activeHand, setActiveHand] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolvedHands, setResolvedHands] = useState<BlackjackFinalHand[]>([]);

  const { chips, setChips, chipsFetched } = useChips();

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

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/games/blackjack", {
        method: "POST",
        body: JSON.stringify({ action: "resume" }),
      });

      const json = await res.json();

      if (json.active) {
        setBetAmt(json.betAmt);
        setHands(json.hands);
        setDealerHand(json.dealerHand);
        setActiveHand(json.activeHand);
        setSidebarExpanded(false);
        setGameActive(true);
        setMessage("Resumed game");
      } else {
        setMessage("Place your bet to start a new game");
      }

      setLoading(false);
    })();
  }, []);

  async function send(action: string, extra: object = {}) {
    const res = await fetch("/api/games/blackjack", {
      method: "POST",
      body: JSON.stringify({ action, betAmt, ...extra }),
    });

    const json = await res.json();

    if (json.message) {
      setMessage(json.message);
      return "failed";
    }

    if (json.hands) setHands(json.hands);
    if (json.dealerUpCard) setDealerHand([json.dealerUpCard]);
    if (json.dealerHand) setDealerHand(json.dealerHand);
    if (json.playerHand) setHands([json.playerHand]);
    if (json.activeHand !== undefined) setActiveHand(json.activeHand);

    if (json.finalHands) {
      setHands(json.finalHands.map((h: BlackjackFinalHand) => h.cards));
      setResolvedHands(json.finalHands);
      setGameActive(false);
      setMessage("Game over, play again?");
      if (json.updatedChips !== undefined || json.updatedChips != null) {
        setChips(json.updatedChips);
      }
    }
  }

  async function startGame() {
    if (
      !betAmt ||
      betAmt <= 0 ||
      betAmt > chips ||
      betAmt < 0 ||
      !Number.isInteger(betAmt)
    )
      return;

    setMessage("Starting game...");

    const result = await send("start");

    if (result === "failed") return;

    setResolvedHands([]);
    setSidebarExpanded(false);
    setGameActive(true);
    setMessage("Your move");
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={containerRef}
        className="h-[80%] w-[90%] bg-gray-700 rounded-2xl text-center overflow-auto flex"
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
            <h1 className="mx-2 text-5xl font-bold">Blackjack</h1>
            <div className="mt-6 w-full flex justify-center">
              <div
                className={`bg-black border-2 border-white rounded-2xl transition-colors duration-500 mx-2! h-8 max-w-125 flex items-center justify-between overflow-hidden ${
                  betAmt && chipsFetched && betAmt > chips
                    ? "bg-red-600"
                    : "bg-black"
                }`}
              >
                <input
                  className={`flex-1 focus:outline-0 text-white h-full pl-2 ${
                    betAmt == 0 && "text-red-600!"
                  }`}
                  title="bet"
                  value={betAmt || ""}
                  onChange={(e) => setBetAmt(parseInt(e.target.value) || null)}
                  placeholder="Bet Amount"
                  type="text"
                />
                <div className="flex items-center h-full p-0 m-0">
                  /{chips}
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
                    All In
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <PrimaryButton
                text={sidebarExpanded ? "Start Game" : "Restart Game"}
                disabled={gameActive || loading}
                onClick={startGame}
              />
            </div>

            <div className="flex-1 flex items-center">
              <h2 className="text-2xl font-bold">{message}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: !sidebarExpanded ? "70%" : "0%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex items-center justify-center flex-1 h-full overflow-hidden relative"
        >
          {/* the only reason why im using inline styles is to cs tailwind doesnt allow w-[{}px] for optimization reasons */}
          {/* trust its the only way */}

          <div
            className="h-full"
            style={{
              width: (containerWidth * 7) / 10,
              minWidth: (containerWidth * 7) / 10,
            }}
          >
            <div className="relative flex flex-1 h-full flex-col justify-between overflow-hidden">
              <div className="flex justify-center gap-2 -translate-y-1/2 -space-x-50">
                {dealerHand.map((c, i) => (
                  <div
                    className={`p-0 m-0`}
                    style={{
                      transform: `rotate(${
                        180 + (i - (dealerHand.length - 1) / 2) * -25
                      }deg)`,
                      zIndex: -i + 100,
                    }}
                    key={i}
                  >
                    <PlayingCard
                      key={i}
                      suit={c.suit}
                      rank={c.rank}
                      width={56}
                    />
                  </div>
                ))}
              </div>

              <motion.div
                initial={{ translateY: 100 }}
                animate={{
                  translateY: gameActive ? -68 : 0,
                  transition: { ease: ["easeIn", "easeOut"] },
                  transitionDuration: 0.6,
                }}
                className="flex gap-6 justify-around translate-y-1/2"
              >
                {hands.map((hand, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "flex -space-x-50 p-2 rounded-xl transition",
                      i === activeHand && gameActive && "bg-white/10",
                      resolvedHands[i] && !gameActive && (
                        resolvedHands[i].outcome === "win" || resolvedHands[i].outcome === "blackjack"
                          ? "bg-green-600/80"
                          : resolvedHands[i].outcome === "lose" || resolvedHands[i].outcome === "bust"
                          ? "bg-red-600/70"
                          : "bg-yellow-600/70"
                      )
                    )}
                  >
                    {hand.map((c, j) => (
                      <div
                        className={`p-0 m-0`}
                        style={{
                          transform: `rotate(${
                            (j - (hand.length - 1) / 2) * 25
                          }deg)`,
                        }}
                        key={j}
                      >
                        <PlayingCard
                          key={j}
                          suit={c.suit}
                          rank={c.rank}
                          width={56}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
              <motion.div
                initial={{ translateY: 100 }}
                animate={{
                  translateY: gameActive ? 0 : 100,
                  transition: { ease: ["easeIn", "easeOut"] },
                  transitionDuration: 0.6,
                }}
                className="flex justify-center gap-6 bg-background-700 rounded-t-2xl mx-2 w-[calc(100%-16px)] absolute bottom-0"
              >
                <div>
                  <PrimaryButton text="Hit" onClick={() => send("hit")} />
                  <PrimaryButton text="Stand" onClick={() => send("stand")} />
                  <PrimaryButton disabled={!(hands[activeHand]?.length === 2)} text="Double" onClick={() => send("double")} />
                  <PrimaryButton text="Split" onClick={() => send("split")} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
