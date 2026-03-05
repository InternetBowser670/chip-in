/* eslint-disable @next/next/no-img-element */
"use client";

import { Card } from "@/components/ui/card";
import { Candle, GeneralHistory, ProfileData } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { Button } from "@/components/ui/button";
import { sleep } from "@/lib/sleep";
import clsx from "clsx";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>();
  const [history, setHistory] = useState<GeneralHistory[]>([]);
  const [message, setMessage] = useState<string>("")
  const [bio, setBio] = useState<string>("Loading bio...")

  const chartContainerRef = useRef(null);

  const bioMaxLen = 200

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

  async function updateBio(bioContents: string) {
    const res = await fetch("/api/profile/update", {
      method: "POST",
      body: JSON.stringify({ section:"bio", value: bioContents }),
    });

    const resData = await res.json();
    
    setMessage(resData.message)

    await sleep(5000);
    setMessage("");
  };
  
  useEffect(() => {
    async function fetchData() {
      const [profileRes, historyRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/profile/history"),
      ]);

      const profileData = await profileRes.json();
      const historyData = await historyRes.json();

      setBio(profileData.user.bio)
      setProfile(profileData.user);
      setHistory(historyData.history);
    }
    fetchData();
  }, []);

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
              <h1 className="ml-2 text-2xl font-bold">{profile.username}</h1>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
                <p>User Id: {profile.id}</p> |
                <p>
                  Badges:{" "}
                  {profile.badges
                    ? profile.badges.map((val) => val.name).join(",")
                    : "None"}
                </p>
              </div>
            <div>
              <input 
                className="border-2 rounded-lg p-2 field-sizing-content" 
                type="text" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={bioMaxLen}
              />
              <span className={clsx("text-sm text-gray-500 ml-1", 
                bio.length==bioMaxLen && "text-red-500")}>
                {bio.length+'/'+bioMaxLen}
              </span>
              <br></br>
              
              <h1 className="my-4 ml-2 text-xl font-bold">Chip History</h1>
              <div className="h-50" ref={chartContainerRef} />
            </div>
            <div className="flex flex-col items-center justify-center gap-2 mt-2">
            <Button onClick={() => updateBio(bio)} className="text-xl font-bold w-100">Update Profile</Button>
            <h1 className="text-gray-500 italic">{message}</h1>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
