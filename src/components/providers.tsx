"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(
      `ws://localhost:6741/live-user-count?route=${encodeURIComponent(pathname)}`,
    );
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCounts((prev) => ({
          page: data.pageCount ?? prev.page,
          global: data.globalCount ?? prev.global,
        }));
      } catch (e) {
        console.log(e);
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [pathname]);

  return counts;
}
