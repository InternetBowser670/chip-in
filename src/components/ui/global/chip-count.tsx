"use client";

import { useEffect, useState } from "react";
import { PiPokerChip } from "react-icons/pi";

export default function ChipCount() {
  const [chips, setChips] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChips = async () => {
      try {
        const res = await fetch("/api/chips/status");
        if (res.ok) {
          const data = await res.json();
          setChips(data.total ?? 0);
        } else {
          setChips(0);
        }
      } catch {
        setChips(0);
      } finally {
        setLoading(false);
      }
    };

    fetchChips();
  }, []);

  if (loading) return <div>Loading chips...</div>;

  return (
    <div className="flex items-center gap-2 text-xl font-bold">
      <PiPokerChip size={24} />
      <span>{chips?.toLocaleString() ?? 0}</span>
    </div>
  );
}
