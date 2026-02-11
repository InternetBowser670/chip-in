"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";

let globalSocket: WebSocket | null = null;
let isConnecting = false;
const listeners = new Set<(counts: { page: number; global: number }) => void>();

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
    listeners.add(setCounts);

    const connect = () => {
      if (
        isConnecting ||
        globalSocket?.readyState === 1 ||
        globalSocket?.readyState === 0
      ) {
        if (globalSocket?.readyState === 1) {
          globalSocket.send(
            JSON.stringify({ type: "CHANGE_ROUTE", route: pathname }),
          );
        }
        return;
      }

      isConnecting = true;

      const url = process.env.NEXT_PUBLIC_WS_BASE_URL
        ? process.env.NEXT_PUBLIC_WS_BASE_URL + "live-user-count?route=" + encodeURIComponent(pathname)
        : `wss://api.chip-in.internetbowser.com/${encodeURIComponent(pathname)}`;

      const socket = new WebSocket(url);

      socket.onopen = () => {
        isConnecting = false;
        globalSocket = socket;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newCounts = {
            page: data.pageCount ?? 0,
            global: data.globalCount ?? 0,
          };
          listeners.forEach((listener) => listener(newCounts));
        } catch (e) {
          console.error(e);
        }
      };

      socket.onclose = () => {
        isConnecting = false;
        globalSocket = null;
      };
    };

    connect();

    return () => {
      listeners.delete(setCounts);
    };
  }, [pathname]);

  return counts;
}
