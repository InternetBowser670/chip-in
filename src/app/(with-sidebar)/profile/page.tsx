/* eslint-disable @next/next/no-img-element */
"use client";

import Card from "@/components/ui/global/card";
import { Candle, ProfileData } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>();

  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current && profile && profile.history != undefined) {
      const chartOptions = {
        layout: {
          textColor: "white",
          background: { color: "black" },
        },
      };

      const historyChart = createChart(chartContainerRef.current, chartOptions);

      historyChart.timeScale().fitContent();

      const newSeries = historyChart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      const candles = Object.values(
        profile.history.reduce<Record<string, Candle>>((acc, h) => {
          if (!h?.date) return acc;

          const d = new Date(h.date);
          
          if (Number.isNaN(d.getTime())) {
            console.warn("Invalid history date:", h);
            return acc;
          }

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
      );

      const data = candles.sort((a, b) => a.time.localeCompare(b.time));

      console.log(data);
      newSeries.setData(data);

      historyChart.timeScale().fitContent();
    }
  }, [profile]);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      setProfile((await res.json()).user);
    }

    fetchProfile();
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <Card noHover color="blue" className="h-[80%] w-[80%] overflow-auto">
        {!profile ? (
          <>
            <h1 className="ml-2 text-2xl font-bold">Loading profile data...</h1>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              {profile?.has_image && (
                <img
                  src={profile?.image_url ? profile.image_url : ""}
                  alt="User Logo"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <h1 className="ml-2 text-2xl font-bold">{profile.username}</h1>
            </div>
            <div>
              <h1 className="mb-4 ml-2 text-xl font-bold">Chip History</h1>
              <div className="w-full h-75" ref={chartContainerRef} />
              <div className="flex items-center gap-2 mt-2">
                <p>User Id: {profile.id}</p> |
                <p>Badges: {profile.badges.map((val) => val.name).join(",")}</p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
