"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "isAdminCache";
const CACHE_TTL = 1000 * 60 * 5;
type CacheShape = {
  value: boolean;
  expires: number;
};

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    let cachedValue: boolean | null = null;

    const cached = localStorage.getItem(STORAGE_KEY);

    if (cached) {
      try {
        const parsed: CacheShape = JSON.parse(cached);

        if (Date.now() < parsed.expires) {
          cachedValue = parsed.value;
          setIsAdmin(parsed.value);
        }
      } catch {
        // ignore
      }
    }

    async function verifyWithServer() {
      try {
        const res = await fetch("/api/check-admin", {
          credentials: "include",
        });

        const data = await res.json();

        setIsAdmin(data.isAdmin);

        const cache: CacheShape = {
          value: data.isAdmin,
          expires: Date.now() + CACHE_TTL,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
      } catch {
        if (cachedValue === null) {
          setIsAdmin(false);
        }
      }
    }

    verifyWithServer();
  }, []);

  return isAdmin;
}
