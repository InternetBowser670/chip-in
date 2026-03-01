"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ParallaxProvider } from "react-scroll-parallax";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

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

// count

let countSocket: WebSocket | null = null;
let chatSocket: WebSocket | null = null;
let isConnectingCounts = false;
let isConnectingChat = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countListeners = new Set<(counts: any) => void>();
const pingListeners = new Set<(ping: number) => void>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chatListeners = new Set<(msg: any) => void>();
const chatPingListeners = new Set<(ping: number) => void>();

//chat
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chatPingInterval: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let countPingInterval: any = null;

const WS_PROD_BASE = "wss://api.chip-in.internetbowser.com/";
const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE_URL || WS_PROD_BASE;

async function connectCounts(
  pathname: string,
  getToken: () => Promise<string | null>,
) {
  if (countSocket?.readyState === 1) {
    countSocket.send(JSON.stringify({ type: "CHANGE_ROUTE", route: pathname }));
    return;
  }
  if (isConnectingCounts || countSocket?.readyState === 0) return;

  const token = await getToken();

  if (!token) {
    console.warn("WebSocket: No token found, user might be logged out.");
    return;
  }

  isConnectingCounts = true;
  const socket = new WebSocket(
    `${WS_BASE}live-user-count?route=${encodeURIComponent(pathname)}&token=${encodeURIComponent(token)}`,
  );

  socket.onopen = () => {
    isConnectingCounts = false;
    countSocket = socket;
    socket.send(JSON.stringify({ type: "CHANGE_ROUTE", route: pathname }));

    if (countPingInterval) clearInterval(countPingInterval);
    countPingInterval = setInterval(() => {
      if (socket.readyState === 1)
        socket.send(JSON.stringify({ type: "PING", timestamp: Date.now() }));
    }, 1000);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "COUNT_UPDATE") {
        const newCounts = {
          page: data.pageCount ?? 0,
          global: data.globalCount ?? 0,
          coinflip: data.coinflipCount ?? 0,
          mines: data.minesCount ?? 0,
          blackjack: data.blackjackCount ?? 0,
          chat: data.chatCount ?? 0,
        };
        countListeners.forEach((l) => l(newCounts));
      } else if (data.type === "PONG") {
        pingListeners.forEach((l) => l(Date.now() - data.timestamp));
      }
    } catch (e) {
      console.log(e);
    }
  };

  socket.onclose = () => {
    isConnectingCounts = false;
    countSocket = null;
    if (countPingInterval) clearInterval(countPingInterval);
    setTimeout(() => connectCounts(pathname, getToken), 3000);
  };
}

async function connectChat(getToken: () => Promise<string | null>) {
  if (
    isConnectingChat ||
    chatSocket?.readyState === 1 ||
    chatSocket?.readyState === 0
  )
    return;

  const token = await getToken();

  if (!token) {
    console.warn("WebSocket: No token found, user might be logged out.");
    return;
  }

  isConnectingChat = true;
  const socket = new WebSocket(
    `${WS_BASE}live-chat?token=${encodeURIComponent(token)}`,
  );

  socket.onopen = () => {
    isConnectingChat = false;
    chatSocket = socket;

    if (chatPingInterval) clearInterval(chatPingInterval);
    chatPingInterval = setInterval(() => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify({ type: "PING", timestamp: Date.now() }));
      }
    }, 1000);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "CHAT_MESSAGE") {
        chatListeners.forEach((l) => l(data));
      } else if (data.type === "PONG") {
        chatPingListeners.forEach((l) => l(Date.now() - data.timestamp));
      }
    } catch (e) {
      console.log(e);
    }
  };

  socket.onclose = () => {
    isConnectingChat = false;
    chatSocket = null;
    if (chatPingInterval) clearInterval(chatPingInterval);
    setTimeout(() => connectChat(getToken), 3000);
  };
}

export function useLiveUsers() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [counts, setCounts] = useState({
    page: 0,
    global: 0,
    coinflip: 0,
    mines: 0,
    blackjack: 0,
    slots: 0,
    chat: 0,
  });
  const [ping, setPing] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    countListeners.add(setCounts);
    pingListeners.add(setPing);
    connectCounts(pathname, getToken);
    return () => {
      countListeners.delete(setCounts);
      pingListeners.delete(setPing);
    };
  }, [pathname, isLoaded, isSignedIn, getToken]);

  return { ...counts, ping };
}

export function useLiveChat(chatOpen: boolean) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [isInChat, setIsInChat] = useState(false);
  const [messagePing, setMessagePing] = useState(false);

  const { user } = useUser();
  const ping = useChatPing();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (msg: any) => {
      setMessages((prev) => [...prev, msg].slice(-50));

      const joinMsgMatch = /^(.+) joined the chat$/;
      const leftMsgMatch = /^(.+) left the chat$/;

      const match = msg.text?.match(joinMsgMatch);
      const lMatch = msg.text?.match(leftMsgMatch);

      const isSelfJoin = msg.isSystem && (match && match[1] === user?.username || lMatch && lMatch[1] === user?.username);

      if (!isSelfJoin && !chatOpen) {
        setMessagePing(true);
      }
    };

    chatListeners.add(handler);
    connectChat(getToken);
    return () => {
      chatListeners.delete(handler);
    };
  }, [isLoaded, isSignedIn, getToken, user?.username, chatOpen]);

  const join = () => {
    if (chatSocket?.readyState === 1 && !isInChat) {
      chatSocket.send(
        JSON.stringify({
          type: "JOIN_CHAT",
          userId: user?.id,
          username: user?.username || user?.firstName || "Anonymous",
        }),
      );
      setIsInChat(true);
      setMessagePing(false);
    }
  };

  const leave = () => {
    if (chatSocket?.readyState === 1 && isInChat) {
      chatSocket.send(
        JSON.stringify({
          type: "LEAVE_CHAT",
          username: user?.username || user?.firstName || "Anonymous",
        }),
      );
      setIsInChat(false);
    }
  };

  const sendMessage = (text: string) => {
    if (chatSocket?.readyState === 1 && isInChat) {
      chatSocket.send(
        JSON.stringify({
          type: "CHAT_MESSAGE",
          text,
          username: user?.username || user?.firstName || "Anonymous",
        }),
      );
    }
  };

  return { messages, sendMessage, join, leave, isInChat, ping, messagePing };
}

export function useChatPing() {
  const [ping, setPing] = useState(0);
  useEffect(() => {
    chatPingListeners.add(setPing);
    return () => {
      chatPingListeners.delete(setPing);
    };
  }, []);
  return ping;
}
