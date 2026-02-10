"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

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
      setChips(+data.total);
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

export function ThemeProvider({ children, ...props }: React.PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useLiveUsers() {
  const [counts, setCounts] = useState({ page: 0, global: 0 });
  const pathname = usePathname();

  useEffect(() => {
    const socket = new WebSocket(process.env.FORCE_DEV_WS == "true" ?
      `ws://localhost:6741/live-user-count?route=${encodeURIComponent(pathname)}` : `https://relieved-rheta-internetbowser-9b345b52.koyeb.app/live-user-count?route=${encodeURIComponent(pathname)}`
    );

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCounts(prev => ({
          page: data.pageCount ?? prev.page,
          global: data.globalCount ?? prev.global
        }));
      } catch (err) {
        console.error("WS Error:", err);
      }
    };

    return () => socket.close();
  }, [pathname]);

  return counts;
}
