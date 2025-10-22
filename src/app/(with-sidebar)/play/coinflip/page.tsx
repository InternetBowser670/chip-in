"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";
import Card from "@/components/ui/global/card";
import { sleep } from "@/lib/sleep";
import clsx from "clsx";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);

  const { chips, setChips } = useChips();

  const [coinState, setCoinState] = useState<
    "flipping" | "tails" | "heads" | "err"
  >("tails");
  const [betAmt, setBetAmt] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

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
    setMessage("flipping");

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

    if (outcome === "err") {
      alert("An error occurred during the coin flip: " + (json.message || ""));
      return;
    } else if (face == outcome) {
      setMessage("You win!");
    } else {
      setMessage("You lose!");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex overflow-hidden text-center bg-gray-700 rounded-2xl h-[80vh] max-w-[80%]">
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
                className="h-full! bg-background-600 px-2 ml-2! flex items-center justify-center text-center"
                onClick={() => setBetAmt(betAmt * 2)}
              >
                x2
              </button>
              <button
                type="button"
                className="h-full! bg-background-600 px-2 border-l-white border-l-2"
                onClick={() => setBetAmt(betAmt / 2)}
              >
                /2
              </button>
              <button
                type="button"
                className="h-full! bg-background-600 px-2 border-l-white border-l-2"
                onClick={() => setBetAmt(chips)}
              >
                All In
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 mt-4">
              <Card
                chin
                color="red"
                className={clsx(coinState === "flipping" && "grayscale")}
                onClick={() => handleFlip("heads")}
              >
                Start Heads
              </Card>
              <Card
                chin
                color="blue"
                className={clsx(coinState === "flipping" && "grayscale")}
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
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <canvas ref={canvasRef} width="300" height="300" />
        </div>
      </div>
    </div>
  );
}
