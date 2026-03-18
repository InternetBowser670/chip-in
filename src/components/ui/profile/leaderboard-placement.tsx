'use client'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
 

export default function LeaderboardPlacement({userId}:{userId:string}){
  const [placement, setPlacement] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      const res = await fetch("/api/get-users", { method: "POST" });
      const data = await res.json();

      const users = data.users
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((u: any) => ({
          userId: u.id,
          chipCount: Number(u.totalChips) || 0,
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => b.chipCount - a.chipCount);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = users.findIndex((u: any) => u.userId === userId);

      if (index !== -1) {
        setPlacement(index + 1);
      }
    }

    if (userId) {
      fetchLeaderboard();
    }
  }, [userId]);

  return(
    <h1>{"#"+placement}</h1>
  )

}