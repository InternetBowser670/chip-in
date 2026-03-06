"use client";

import { Card } from "@/components/ui/card";
import { Candle, GeneralHistory, ProfileData } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import LeaderboardPlacement from "@/components/ui/profile/leaderboard-placement/leaderboard-placement";
import { MostPlayedGamesChart, MostProfitableGamesChart, PublicLeaderboardPlacementChart } from "@/components/ui/stats/stats-charts";

export default function ProfilesPage() {
  const [profile, setProfile] = useState<ProfileData>();
  const [history, setHistory] = useState<GeneralHistory[]>([]);
  const [placement, setPlacement] = useState<number | null>(null);

  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current || history.length === 0) return;

    try {
      const chartOptions = {
        layout: { textColor: "white", background: { color: "black" } }
      };

      const chart = createChart(chartContainerRef.current, chartOptions);
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a", downColor: "#ef5350", borderVisible: false,
        wickUpColor: "#26a69a", wickDownColor: "#ef5350", wickVisible: true,
      });

      const candles = Object.values(
        history.reduce<Record<string, Candle>>((acc, h) => {
          if (!h?.date) return acc;
          const d = new Date(h.date);
          const day = d.toISOString().split("T")[0];

          if (!acc[day]) {
            acc[day] = {
              time: day,
              open: h.startCount,
              high: Math.max(h.startCount, h.endCount),
              low: Math.min(h.startCount, h.endCount),
              close: h.endCount,
            };
          } else {
            acc[day].high = Math.max(acc[day].high, h.startCount, h.endCount);
            acc[day].low = Math.min(acc[day].low, h.startCount, h.endCount);
            acc[day].close = h.endCount;
          }
          return acc;
        }, {})
      ).sort((a, b) => (a.time as string).localeCompare(b.time as string));

      series.setData(candles);
      chart.timeScale().fitContent();

      return () => chart.remove();
    } catch (e) {
      console.warn(chartContainerRef.current, e);
    }
  }, [history]);

  const userId = "user_3AEX6zPf9sNZI1wBilQHDsGNrGK";
  
  useEffect(() => {
    async function fetchData() {
      const [profileRes, historyRes] = await Promise.all([
        fetch("/api/profile/public-profile", {
        method: "POST",
        body: JSON.stringify({ userId }),}),
        fetch("/api/profile/public-profile/history", {
          method: "POST",
          body: JSON.stringify({ userId }),}),
      ])
      
      const profileData = await profileRes.json();
      const historyData = await historyRes.json();

      setProfile(profileData.user);
      setHistory(historyData.history);
    }
    fetchData();
  }, []);

  //Leaderboard
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


  return (
    <div className="flex items-center justify-center h-full">
      <Card color="blue" className="h-[80%] w-[80%] overflow-auto p-4">
        {!profile ? (
          <>
            <h1 className="ml-2 text-2xl font-bold">Loading profile data...</h1>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <img
                src={profile?.image_url ? profile.image_url : ""}
                alt="User Logo"
                className="w-16 h-16 rounded-full"
              />
              <div>
              <h1 className="ml-2 text-4xl font-bold">{profile.username}</h1>
              <p className="text-gray-500 translate-x-2">{profile.id}</p>
              </div>
            </div>
            
            <div>
              {profile.bio &&
              <div className="border-2 w-fit rounded-lg p-2 min-w-20">
              <h1 className="break-all">{profile.bio}</h1>
              </div>
              }
              <hr className="my-4"></hr>
              <h1 className="my-4 ml-2 text-xl font-bold">{"Total chips: "+profile.totalChips}</h1>
              <h1 className="my-4 ml-2 text-xl font-bold">Chip History</h1>
              <div className="h-50" ref={chartContainerRef} />
              <hr className="my-4"></hr>
              <div className="h-80 flex items-center gap-2">
              <MostPlayedGamesChart userId={profile.id}/>
              <MostProfitableGamesChart userId={profile.id}/>
              <PublicLeaderboardPlacementChart profile={profile}/>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}