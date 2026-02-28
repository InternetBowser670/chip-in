'use client';

import { motion } from "motion/react";
import { useState, useRef } from "react";
import { useChips } from "@/components/providers";
import { PiPokerChip } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { BannerAd } from "@/components/ui/global/ads";
import { Field } from "@/components/ui/field";
import clsx from "clsx";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { sleep } from "@/lib/sleep";
import confetti from "canvas-confetti";
import Image from "next/image";

export default function Page(){
  const items = [
    '/slots/seven.png',
    '/slots/whitebar.png',
    '/slots/gem.png',
    '/slots/clover.png',
    '/slots/bell.png',
  ]
  
  const [slot1Img, setSlot1Img] = useState<string>('');
  const [slot2Img, setSlot2Img] = useState<string>('');
  const [slot3Img, setSlot3Img] = useState<string>('');

  const { chips, setChips, chipsFetched } = useChips();
  
  const [betAmt, setBetAmt] = useState<number | null>(null);
  const [extendSidebar, setExtendSidebar] = useState<boolean>(true);
  const [slotsSpinning, setSlotsSpinning] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Place your bet to start a new game!");
  const [outcomesRef, setOutcomesRef] = useState<number[]>([1,1,1])
  
  async function handleSpin() {
    if (betAmt == null || betAmt <= 0 || !Number.isInteger(betAmt)) {
      return alert("Invalid bet amount");
    }
    
    if (slotsSpinning) return;
    
    setSlotsSpinning(true);
    setExtendSidebar(false);
    setMessage("Spinning... ");

    const reelCount = 3; 

    const res = await fetch("/api/games/slots", {
      method: "POST",
      body: JSON.stringify({ betAmt, reels: reelCount }),
    });

    let json;
    try {
      json = await res.json();
    } catch {
      json = { outcomes: ["err"], message: "Invalid or empty response" };
    }

    const outcomes = json.outcomes || 'err';
    setOutcomesRef(json.outcomes);

    if (json.updatedChips !== undefined) {
      setChips(json.updatedChips);
    }
    
    setSlotsSpinning(false);
    
    if (outcomes != 'err') {
      let isWin = outcomes.every((n:number) => n === outcomes[0]);
    if (isWin) {
      
      //Confetti
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
      setMessage('You win!')
    } else {
      setMessage('You lose, spin again?');
    }
    } else {
      setMessage('err');
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
          <div className="h-full">
            <motion.h1 className="text-5xl font-bold">Slots</motion.h1>
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
                slotsSpinning
                ? "grayscale cursor-not-allowed"
                : "cursor-pointer",
                )}
                onClick={() =>
                !slotsSpinning &&
                handleSpin()
                }
              >
                Spin
              </Button>
            </div>
            <br />
            <br />
            <h2 className="text-2xl font-bold text-center">{message}</h2>
            <BannerAd className="flex justify-center mt-2" />
          </div>
        </motion.div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: extendSidebar ? 0 : "60%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`flex-1 py-4 overflow-hidden ${!extendSidebar && "p-4"}`}
        >
          <div className="flex items-center justify-center">
          <div className="flex h-[calc(100%-64px)] my-32 justify-center items-center pt-2 border-2 rounded-lg">
            <Image src={items[outcomesRef[0]-1]} width={200} height={300} alt={'Slot 1'}/>
            <Image src={items[outcomesRef[1]-1]} width={200} height={300} alt={'Slot 2'}/>
            <Image src={items[outcomesRef[2]-1]} width={200} height={300} alt={'Slot 3'}/>
          </div>
          </div>
          <a href="https://www.vecteezy.com/free-vector/slot-machine" target="_blank"className="text-grey-50 italic">Slot Machine Vectors made by Vecteezy</a>
        </motion.div>
      </div>
    </div>
    )
}