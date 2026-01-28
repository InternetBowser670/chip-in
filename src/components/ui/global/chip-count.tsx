"use client";

import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";
import Counter from "@/components/Counter";

export default function ChipCount() {
  const { chips } = useChips();

  return (
    <div className="flex items-center gap-2 mt-2 text-xl font-bold">
      <PiPokerChip size={24} />
      <Counter
        gradientFrom="#484b51"
        fontSize={17}
        gradientHeight={2}
        gap={0}
        value={+chips.toFixed(2)}
      />
    </div>
  );
}
