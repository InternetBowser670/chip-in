"use client";

import { useEffect, useState } from "react";
import { Button } from "../button";
import { useChips } from "@/components/providers";
import dynamic from "next/dynamic";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

type StatusResponse = {
  canClaim: boolean;
  total?: number;
};

const wheelData = [
  { option: "3,000" },
  { option: "5,000" },
  { option: "10,000" },
  { option: "15,000" },
  { option: "20,000" },
  { option: "30,000" },
  { option: "40,000" },
  { option: "50,000" },
];

const rewards = [3000, 5000, 10000, 15000, 20000, 30000, 40000, 50000];

export default function DailySpin() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const { setChips } = useChips();

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/chips/status");
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
      if (data.total !== undefined) {
        setChips(data.total);
      }
    };

    fetchStatus();
  }, [setChips]);

  const handleSpin = async () => {
    if (!status?.canClaim || isLocked) return;

    setIsLocked(true);
    setMustSpin(true);

    try {
      const res = await fetch("/api/chips/claim", {
        method: "POST",
      });

      if (!res.ok) {
        setIsLocked(false);
        setMustSpin(false);
        return;
      }

      const data = await res.json();
      const reward = data.reward;

      const index = rewards.findIndex((r) => r === reward);
      if (index === -1) {
        setIsLocked(false);
        setMustSpin(false);
        return;
      }

      setPrizeIndex(index);

      setChips(data.total);
    } catch {
      setIsLocked(false);
      setMustSpin(false);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setIsLocked(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeIndex}
        data={wheelData}
        onStopSpinning={handleStopSpinning}
        backgroundColors={["#1f2937", "#111827"]}
        textColors={["#ffffff"]}
      />

      <Button
        onClick={handleSpin}
        disabled={!status?.canClaim || isLocked}
        className="w-full"
      >
        {isLocked
          ? "Spinning..."
          : status?.canClaim
          ? "Spin for Daily Chips"
          : "Come back tomorrow"}
      </Button>
    </div>
  );
}