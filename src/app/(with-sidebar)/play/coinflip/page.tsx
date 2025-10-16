"use client";

import { useEffect, useRef, useState } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { PrimaryButtonChildren } from "@/components/ui/global/buttons";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);
  const [coinState, setCoinState] = useState<
    "flipping" | "tails" | "heads" | "err"
  >("tails");

  useEffect(() => {
    if (!canvasRef.current) return;

    const dotLottie = new DotLottie({
      canvas: canvasRef.current,
      src: "https://lottie.host/5f9fe7cd-0b12-40e7-9693-5d674894d047/tjCkcZlb4e.lottie",
      autoplay: true,
      loop: false,
      stateMachineConfig: {
        openUrlPolicy: {
          requireUserInteraction: true,
          whitelist: ["https://trusted-site.com"],
        },
      },
    });

    dotLottieRef.current = dotLottie;

    dotLottie.addEventListener("load", () => {
      dotLottie.stateMachineLoad("StateMachine1");
      dotLottie.stateMachineStart();
      console.log("State machine started:", dotLottie.stateMachineGetStatus());
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
      console.log("Triggered event:", coinState);
    } catch (err) {
      console.warn("Could not post event:", err);
    }
  }, [coinState]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex-col items-center p-4 bg-gray-700 rounded-2xl text-center">
        <h1 className="text-3xl font-bold mb-2">I&apos;m working on it!</h1>
        <h1 className="text-xl text-gray-400 mb-2">Enjoy my animation for now</h1>

        <div className="flex justify-center">
          <canvas ref={canvasRef} width="300" height="300" />
        </div>

        <div className="mt-4 flex gap-2 justify-center">
          <PrimaryButtonChildren onClick={() => setCoinState("flipping")}>
            Flip 🔁
          </PrimaryButtonChildren>
          <PrimaryButtonChildren onClick={() => setCoinState("heads")}>
            Heads 🌕
          </PrimaryButtonChildren>
          <PrimaryButtonChildren onClick={() => setCoinState("tails")}>
            Tails 🪙
          </PrimaryButtonChildren>
          <PrimaryButtonChildren onClick={() => setCoinState("err")}>
            Error ❌
          </PrimaryButtonChildren>
        </div>
        <p className="mt-3 text-gray-300">You can only change the state to a face when the coin is flipping</p>
      </div>
    </div>
  );
}
