"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ParallaxProvider } from "react-scroll-parallax";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ParallaxProvider>
      <ChipsProvider>{children}</ChipsProvider>
    </ParallaxProvider>
  );
}

type ChipsContextType = {
  chips: number;
  setChips: (chips: number) => void;
  chipsFetched?: boolean;
};

const ChipsContext = createContext<ChipsContextType | null>(null);

function ChipsProvider({ children }: { children: React.ReactNode }) {
  const [chips, setChips] = useState(0);
  const [chipsFetched, setChipsFetched] = useState(false);

  useEffect(() => {
    const fetchChips = async () => {
      const res = await fetch("/api/chips/status");
      const data = await res.json();
      setChips(data.total ?? 0);
      setChipsFetched(true);
    };
    fetchChips();
  }, []);

  return (
    <ChipsContext.Provider value={{ chips, setChips, chipsFetched }}>
      {children}
    </ChipsContext.Provider>
  );
}

export function useChips() {
  const ctx = useContext(ChipsContext);
  if (!ctx) throw new Error("useChips must be used inside ChipsProvider");
  return ctx;
}
