"use client";

import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";

export default function ChipCount() {
  const { chips } = useChips();

  return (
    <div className="flex items-center gap-2 mt-2 text-xl font-bold">
      <PiPokerChip size={24} />
      <span>{chips.toFixed(2).toLocaleString() }</span>
    </div>
  );
}
