"use client";

import { useEffect, useState } from "react";
import { PrimaryButtonChildren } from "./buttons";
import { PiPokerChip } from "react-icons/pi";

type StatusResponse = {
  canClaim: boolean;
  amount: number | null;
  nextAvailable: string | null;
};

export default function ClaimChips() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch("/api/chips/status");
      if (res.ok) {
        const data: StatusResponse = await res.json();
        setStatus(data);
      }
    };
    fetchStatus();
  }, []);

  const handleClaim = async () => {
    if (!status?.canClaim || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chips/claim", {
        method: "POST",
      });
      if (res.ok) {
        setClaimed(true);
        const newStatusRes = await fetch("/api/chips/status");
        const newStatus: StatusResponse = await newStatusRes.json();
        setStatus(newStatus);
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonText = (() => {
    if (!status) return "Loading...";
    if (claimed) return "Claimed!";
    if (status.canClaim && status.amount)
      return `Claim ${status.amount.toLocaleString()} `;
    if (!status.canClaim && status.nextAvailable) {
      const next = new Date(status.nextAvailable).toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `Come back at ${next}`;
    }
    return "Unavailable";
  })();

  return (
    <PrimaryButtonChildren
      className="w-[90%]"
      onClick={handleClaim}
      disabled={!status?.canClaim || loading || claimed}
    >
      <span className="flex items-center gap-1">
        {buttonText}
        {status?.canClaim && <PiPokerChip size={30} />}
      </span>
    </PrimaryButtonChildren>
  );
}
