"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";
import Card from "@/components/ui/global/card";
import { sleep } from "@/lib/sleep";
import clsx from "clsx";
import confetti from "canvas-confetti";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);

  const { chips, setChips } = useChips();

  const [coinState, setCoinState] = useState<
    "flipping" | "tails" | "heads" | "err"
  >("tails");
  const [betAmt, setBetAmt] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [pastFlips, setPastFlips] = useState<
    Array<{
      betFace: "heads" | "tails";
      outcome: "heads" | "tails" | "err";
      betAmt: number;
    }>
  >([]);

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
    });

    return () => {
      dotLottie.destroy();
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
    if (betAmt <= 0 || !Number.isInteger(betAmt)) {
      return alert("Invalid bet amount");
    }

    if (coinState === "flipping") return;

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
      <div className="flex overflow-hidden text-center bg-gray-700 rounded-2xl h-[80vh] max-w-[80%]! max-w-[80%]">
        <div className="h-full! p-4 bg-background-700 rounded-r-2xl">
          <div>
            <h1 className="text-5xl font-bold">Coinflip</h1>
            <br />
            <div className="pl-2 bg-black border-2 border-white rounded-2xl transition-colors duration-500 mx-2! h-8 flex items-center overflow-hidden">
              <input
                className="focus:outline-0 "
                title="bet"
                value={betAmt}
                onChange={(e) => setBetAmt(parseInt(e.target.value) || 0)}
                placeholder="Bet Amount"
                type="text"
              />
              <PiPokerChip className="inline ml-2!" size={24} />
              <button
                type="button"
                className="h-full! bg-background-600 px-2 ml-2! flex items-center justify-center text-center border-l-white border-l-2"
                onClick={() => setBetAmt(betAmt * 2)}
              >
                x2
              </button>
              <button
                type="button"
                className="h-full! bg-background-600 px-2 border-x-white border-x-2"
                onClick={() => setBetAmt(betAmt / 2)}
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
            <div className="flex items-center justify-between gap-2 mt-4">
              <Card
                chin
                color="red"
                className={clsx(
                  coinState === "flipping"
                    ? "grayscale cursor-not-allowed"
                    : "cursor-pointer"
                )}
                onClick={() => handleFlip("heads")}
              >
                Start Heads
              </Card>
              <Card
                chin
                color="blue"
                className={clsx(
                  coinState === "flipping"
                    ? "grayscale cursor-not-allowed"
                    : "cursor-pointer"
                )}
                onClick={() => handleFlip("tails")}
              >
                Start Tails
              </Card>
            </div>
            <br />
            <br />
            <h2 className="text-2xl font-bold text-center">{message}</h2>
          </div>
        </div>
        <div className="p-4">
          <div
            className={clsx(
              "flex gap-2 opacity-0 transition-all duration-300 overflow-hidden max-w-full",
              pastFlips.length > 0 && "opacity-100"
            )}
          >
            {pastFlips.map((flip, i) => (
              <Card
                color={flip.betFace == flip.outcome ? "green" : "red"}
                className={clsx(
                  "h-4 flex justify-center items-center transition-all duration-300 w-30",
                  flip.betFace == flip.outcome ? "bg-green-500" : "bg-red-500",
                  "animate-[flipIn_.35s_ease-out]"
                )}
                key={i}
              >
                {flip.betFace[0].toLocaleUpperCase()} - {flip.betAmt}
              </Card>
            ))}
          </div>
          <div className="flex items-center justify-center w-full h-full">
            <canvas ref={canvasRef} width="300" height="300" />
          </div>
        </div>
      </div>
    </div>
  );
}
