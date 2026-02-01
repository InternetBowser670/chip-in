"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { Field } from "@/components/ui/field";
import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";
import { sleep } from "@/lib/sleep";
import clsx from "clsx";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useTheme } from "next-themes";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);

  const { resolvedTheme } = useTheme();

  const { chips, setChips, chipsFetched } = useChips();

  const [coinState, setCoinState] = useState<
    "flipping" | "tails" | "heads" | "err"
  >("heads");
  const [betAmt, setBetAmt] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Loading Animations...");
  const [pastFlips, setPastFlips] = useState<
    Array<{
      betFace: "heads" | "tails";
      outcome: "heads" | "tails" | "err";
      betAmt: number;
    }>
  >([]);
  const [extendSidebar, setExtendSidebar] = useState<boolean>(true);
  const [animReady, setAnimReady] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const dotLottie = new DotLottie({
      canvas: canvasRef.current,
      src: "https://lottie.host/5f9fe7cd-0b12-40e7-9693-5d674894d047/tjCkcZlb4e.lottie",
      autoplay: true,
      loop: false,
    });

    dotLottieRef.current = dotLottie;

    dotLottie.addEventListener("load", () => {
      dotLottie.stateMachineLoad("StateMachine1");
      dotLottie.stateMachineStart();
      setAnimReady(true);
      setMessage("Place your bet!");
    });

    return () => {
      dotLottie.destroy();
      setCoinState("heads");
    };
  }, []);

  useEffect(() => {
    const dotLottie = dotLottieRef.current;
    if (!dotLottie) return;

    try {
      dotLottie.stateMachineSetStringInput("coinState", coinState);
    } catch (err) {
      console.warn("Could not post event:", err);
    }
  }, [coinState]);

  async function handleFlip(face: "heads" | "tails") {
    if (betAmt == null || betAmt <= 0 || !Number.isInteger(betAmt)) {
      return alert("Invalid bet amount");
    }

    if (coinState === "flipping") return;

    setExtendSidebar(false);

    setCoinState("flipping");
    setMessage("Flipping...");

    const res = await fetch("/api/games/coinflip", {
      method: "POST",
      body: JSON.stringify({ betAmt, betFace: face }),
    });

    let json;

    try {
      json = await res.json();
    } catch {
      json = { outcome: "err", message: "Invalid or empty response" };
    }

    const outcome = json.outcome || "err";

    setCoinState(outcome);

    await sleep(4500);

    if (json.updatedChips !== undefined) {
      setChips(json.updatedChips);
    }

    setPastFlips([{ betFace: face, outcome, betAmt }, ...pastFlips]);

    if (outcome === "err") {
      alert("An error occurred during the coin flip: " + (json.message || ""));
      return;
    } else if (face == outcome) {
      setMessage("You win!");

      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;
      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    } else {
      setMessage("You lose!");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex overflow-hidden text-center h-[80vh] w-[80%]! flex-row py-0 bg-background border rounded-2xl">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: !extendSidebar ? "40%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="h-full p-4 border-r bg-card rounded-r-2xl"
        >
          <div>
            <motion.h1 className="text-5xl font-bold">Coinflip</motion.h1>
            <br />
            <div className="flex justify-center w-full">
              <motion.div
              className="flex justify-center mt-6"
              initial={{ width: "40%" }}
              animate={{ width: !extendSidebar ? "100%" : "40%" }}
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
            </div>
            <div className="flex items-center justify-center mt-4 gap-15">
              <Button
                variant={"default"}
                className={clsx(
                  coinState === "flipping" || animReady === false
                    ? "grayscale cursor-not-allowed"
                    : "cursor-pointer",
                )}
                onClick={() =>
                  !(coinState === "flipping" || animReady === false) &&
                  handleFlip("heads")
                }
              >
                Start Heads
              </Button>
              <Button
                variant={"default"}
                className={clsx(
                  coinState === "flipping" || animReady === false
                    ? "grayscale cursor-not-allowed"
                    : "cursor-pointer",
                )}
                onClick={() =>
                  !(coinState === "flipping" || animReady === false) &&
                  handleFlip("tails")
                }
              >
                Start Tails
              </Button>
            </div>
            <br />
            <br />
            <h2 className="text-2xl font-bold text-center">{message}</h2>
          </div>
        </motion.div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: extendSidebar ? 0 : "60%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`flex-1 py-4 overflow-hidden ${!extendSidebar && "p-4"}`}
        >
          <div
            className={clsx(
              "flex gap-2 opacity-0 transition-all duration-300 overflow-hidden w-fit h-12 items-center",
              pastFlips.length > 0 && "opacity-100",
            )}
          >
            {pastFlips.map((flip, i) => (
              <div
                className={clsx(
                  "h-4 flex justify-center items-center transition-all duration-300 min-w-30 p-4 py-6 rounded-2xl",
                  resolvedTheme == "light" ? (flip.betFace == flip.outcome ? "bg-green-500/85" : "bg-red-500/85") : (flip.betFace == flip.outcome ? "bg-green-500" : "bg-red-500"),
                  "animate-[flipIn_.35s_ease-out]",
                )}
                key={i}
              >
                {flip.betFace[0].toLocaleUpperCase()} - {flip.betAmt}
              </div>
            ))}
          </div>
          <div className="flex h-[calc(100%-64px)] w-full justify-center items-center pt-2">
            <canvas ref={canvasRef} width="400" height="400" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
