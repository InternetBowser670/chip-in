"use client";

import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";
import Counter from "@/components/Counter";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ChipCount() {
  const [mounted, setMounted] = useState(false);

  const { chips } = useChips();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xl font-bold">
      {mounted ? (
        <>
          <PiPokerChip size={24} />
          <Counter
            gradientFrom={resolvedTheme == "light" ? "#f2fafd" : "#171925"}
            fontSize={17}
            gradientHeight={2}
            gap={0}
            value={+chips.toFixed(2)}
          />
        </>
      ) : (
        <>Loading...</>
      )}
    </div>
  );
}
