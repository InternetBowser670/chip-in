"use client";

import { useChips } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field } from "@/components/ui/field";
import PlayingCard from "@/components/ui/games/any/card";
import { BannerAd } from "@/components/ui/global/ads";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { BlackjackFinalHand, Card } from "@/lib/types";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
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
        setDealerHand([
          ...json.dealerHand,
          { suit: "clubs", rank: "A", faceDown: true },
        ]);
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
    if (json.dealerUpCard) {
      setDealerHand([
        json.dealerUpCard,
        { suit: "clubs", rank: "A", faceDown: true },
      ]);
    }

    if (json.dealerHand) setDealerHand(json.dealerHand.reverse());
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
      return setMessage("Invalid bet amount");

    setMessage("Starting game...");

    setHands([]);
    setDealerHand([]);
    setActiveHand(0);

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
        className="h-[80%] w-[90%] bg-background rounded-2xl text-center overflow-auto flex border"
      >
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: !sidebarExpanded ? "30%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`h-full p-4 border-r bg-card rounded-r-2xl ${
            sidebarExpanded ? "w-full" : "w-16"
          }`}
        >
          <div className="flex flex-col items-center h-full">
            <h1 className="mx-2 text-5xl font-bold">Blackjack</h1>
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

            <div className="mt-6">
              <Button disabled={gameActive || loading} onClick={startGame}>
                {sidebarExpanded ? "Start Game" : "Restart Game"}
              </Button>
            </div>

            <div className="flex items-center">
              <h2 className="my-8 text-2xl font-bold">{message}</h2>
            </div>
            <BannerAd className="flex justify-center" />
          </div>
        </motion.div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: !sidebarExpanded ? "70%" : "0%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="relative flex items-center justify-center flex-1 h-full overflow-hidden"
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
            <div className="relative flex flex-col justify-between flex-1 h-full overflow-hidden">
              <AnimatePresence>
                {dealerHand.length > 0 && (
                  <motion.div
                    key="dealer-hand"
                    initial={{ y: "-200%" }}
                    animate={{ y: "-50%" }}
                    exit={{ y: "-200%" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex justify-center gap-2 -space-x-50"
                  >
                    {dealerHand.map((c, i) => {
                      return (
                        <motion.div
                          className={`p-0 m-0`}
                          animate={{
                            y: "-50%",
                            transform: `rotate(${
                              (i - (dealerHand.length - 1) / 2) * -25
                            }deg)`,
                          }}
                          style={{ zIndex: -i + 100 }}
                          key={i}
                        >
                          <PlayingCard
                            className="rotate-180"
                            key={i}
                            suit={c.suit}
                            rank={c.rank}
                            width={56}
                            faceDown={c.faceDown}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ translateY: 100 }}
                animate={{
                  translateY: gameActive ? -68 : 0,
                  translateX: !(hands.length > 2) ? 0 : -200 * activeHand,
                  transition: { ease: ["easeIn", "easeOut"] },
                  transitionDuration: 0.6,
                }}
                className="flex justify-around gap-6 translate-y-1/2"
              >
                <AnimatePresence>
                  {hands.map((hand, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ y: "200%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "200%" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      style={{ width: "400px" }}
                      className={clsx(
                        "flex p-2 rounded-xl relative",
                        i === activeHand && gameActive && "bg-card border",
                        resolvedHands[i] &&
                          !gameActive &&
                          (resolvedHands[i].outcome === "win" ||
                          resolvedHands[i].outcome === "blackjack"
                            ? "bg-green-600/80"
                            : resolvedHands[i].outcome === "lose" ||
                                resolvedHands[i].outcome === "bust"
                              ? "bg-red-600/70"
                              : "bg-yellow-600/70"),
                      )}
                    >
                      <div
                        className="flex"
                        style={{ translate: (224 * hand.length - 400) / -2 }}
                      >
                        {hand.map((c, j) => {
                          const fanX = (j - (hand.length - 1) / 2) * -200;
                          const fanRotate = (j - (hand.length - 1) / 2) * 25;

                          return (
                            <motion.div
                              key={c.suit + c.rank}
                              layout
                              style={{ x: fanX, rotate: fanRotate }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="relative"
                              animate={{ y: 0 }}
                              initial={{ y: "100%" }}
                            >
                              <PlayingCard
                                suit={c.suit}
                                rank={c.rank}
                                width={56}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              <motion.div
                initial={{ translateY: 100 }}
                animate={{
                  translateY: gameActive ? 0 : 100,
                  transition: { ease: ["easeIn", "easeOut"] },
                  transitionDuration: 0.6,
                }}
                className="flex justify-center gap-6 bg-card items-center rounded-t-2xl mx-2 w-[calc(100%-16px)] absolute bottom-0 border border-b-0"
              >
                <ButtonGroup className="my-4">
                  <Button variant={"outline"} onClick={() => send("hit")}>
                    Hit
                  </Button>
                  <Button variant={"outline"} onClick={() => send("stand")}>
                    Stand
                  </Button>
                  <Button
                    disabled={
                      !(hands[activeHand]?.length === 2) || hands.length > 1
                    }
                    variant={"outline"}
                    onClick={() => send("double")}
                  >
                    Double
                  </Button>
                  <Button
                    disabled={
                      !(
                        hands[activeHand]?.length === 2 &&
                        hands[activeHand]?.[0].rank ===
                          hands[activeHand]?.[1].rank
                      ) || hands.length > 1
                    }
                    variant={"outline"}
                    onClick={() => send("split")}
                  >
                    Split
                  </Button>
                </ButtonGroup>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
