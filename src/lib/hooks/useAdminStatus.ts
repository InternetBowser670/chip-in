"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "isAdminCache";
const CACHE_TTL = 1000 * 60 * 60;

type CacheShape = {
  value: boolean;
  expires: number;
};

export function useAdminStatus(): boolean | null {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let didUseCache = false;

    try {
      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        const parsed: CacheShape = JSON.parse(cached);

        if (Date.now() < parsed.expires) {
          didUseCache = true;
          setIsAdmin(parsed.value);
        }
      }
    } catch {
      // ignore
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
        if (!didUseCache) {
          setIsAdmin(false);
        }
      }
    }

    verifyWithServer();
  }, []);

  return isAdmin;
}
