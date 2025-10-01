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
};

const ChipsContext = createContext<ChipsContextType | null>(null);

function ChipsProvider({ children }: { children: React.ReactNode }) {
  const [chips, setChips] = useState(0);

  useEffect(() => {
    const fetchChips = async () => {
      const res = await fetch("/api/chips/status");
      const data = await res.json();
      setChips(data.total ?? 0);
    };
    fetchChips();
  }, []);

  return (
    <ChipsContext.Provider value={{ chips, setChips }}>
      {children}
    </ChipsContext.Provider>
  );
}

export function useChips() {
  const ctx = useContext(ChipsContext);
  if (!ctx) throw new Error("useChips must be used inside ChipsProvider");
  return ctx;
}
