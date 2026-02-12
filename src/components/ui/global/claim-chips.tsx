"use client";

import { useEffect, useState } from "react";
import { Button } from "../button";
import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";

type StatusResponse = {
  canClaim: boolean;
  amount: number | null;
  nextAvailable: string | null;
  total?: number;
};

export default function ClaimChips() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const { setChips } = useChips();

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/chips/status");
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setStatus(data);
        if (data.total !== undefined) {
          setChips(data.total);
        }
      }
    };
    fetchStatus();
  }, [setChips]);

  const handleClaim = async () => {
    if (!status?.canClaim || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chips/claim", {
        method: "POST",
      });
      if (res.ok) {
        const claimData = await res.json();
        setClaimed(true);
        if (claimData.total !== undefined) {
          setChips(claimData.total);
        }

        const newStatusRes = await fetch("/api/chips/status");
        const newStatus: StatusResponse = await newStatusRes.json();
        setStatus(newStatus);
        if (newStatus.total !== undefined) {
          setChips(newStatus.total);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/chips/status");
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setStatus(data);
        if (data.total !== undefined) {
          setChips(data.total);
        }
      }
    };

    document.addEventListener("visibilitychange", fetchStatus);

    return () => {
      document.removeEventListener("visibilitychange", fetchStatus);
    };
  }, [setChips]);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/chips/status");
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setStatus(data);
        if (data.total !== undefined) {
          setChips(data.total);
        }
      }
    };

    fetchStatus();

    // intentionally 6 mins instead of every hour
    const intervalId = setInterval(fetchStatus, 360000);

    return () => clearInterval(intervalId);
  }, [setChips]);

  const buttonText = (() => {
    if (!status) return "Loading...";
    if (claimed) return "Claimed!";
    if (status.canClaim && status.amount)
      return `Claim ${status.amount.toLocaleString()} `;
    if (!status.canClaim && status.nextAvailable) {
      return `Come back tomorrow.`;
    }
    return "Unavailable";
  })();

  return (
    <Button
      className="w-full"
      onClick={handleClaim}
      disabled={!status?.canClaim || loading || claimed}
    >
      <span className="flex items-center gap-1">
        {buttonText}
        {status?.canClaim && <PiPokerChip size={30} />}
      </span>
    </Button>
  );
}
