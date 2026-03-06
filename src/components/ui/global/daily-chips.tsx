"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../button";
import { useChips } from "@/components/providers";
import dynamic from "next/dynamic";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false },
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
  const [loading, setLoading] = useState(true);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);

  const pendingTotalRef = useRef<number | null>(null);

  const { setChips } = useChips();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/chips/status");
        if (!res.ok) return;

        const data = await res.json();
        setStatus(data);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleSpin = async () => {
    if (!status?.canClaim || isLocked || loading) return;

    setIsLocked(true);

    try {
      const res = await fetch("/api/chips/claim", {
        method: "POST",
      });

      if (!res.ok) {
        setIsLocked(false);
        return;
      }

      const data = await res.json();
      const reward = data.reward;

      const index = rewards.indexOf(reward);

      if (index < 0) {
        setIsLocked(false);
        return;
      }

      pendingTotalRef.current = data.total;

      setPrizeIndex(index);
      setMustSpin(true);

      setStatus((prev) => (prev ? { ...prev, canClaim: false } : prev));
    } catch {
      setIsLocked(false);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);

    if (pendingTotalRef.current !== null) {
      setChips(pendingTotalRef.current);
      pendingTotalRef.current = null;
    }

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
        disabled={loading || !status?.canClaim || isLocked}
        className="w-full"
      >
        {loading
          ? "Loading..."
          : isLocked
            ? "Spinning..."
            : status?.canClaim
              ? "Spin for Daily Chips"
              : "Come back tomorrow"}
      </Button>
    </div>
  );
}
