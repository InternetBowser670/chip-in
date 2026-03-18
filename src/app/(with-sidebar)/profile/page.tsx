/* eslint-disable @next/next/no-img-element */
"use client";

import { Card } from "@/components/ui/card";
import { Candle, GeneralHistory, ProfileData } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { MostPlayedGamesChart, MostProfitableGamesChart, PublicLeaderboardPlacementChart } from "@/components/ui/stats/stats-charts";
//import PublicSwitch from "@/components/ui/profile/public-switch";
import { Button } from "@/components/ui/button";
import { sleep } from "@/lib/sleep";
import clsx from "clsx";
import { BsEye, BsEyeSlash } from "react-icons/bs";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>();
  const [history, setHistory] = useState<GeneralHistory[]>([]);
  const [message, setMessage] = useState<string>("");
  const [bio, setBio] = useState<string>("Loading bio...");

  const chartContainerRef = useRef(null);

  const bioMaxLen = 200

  function PublicSwitch({card}:{card:number}){
    const value = profile?.profilePublic? profile?.profilePublic[card]: false;
    const [loading, setLoading] = useState(false);
    
    const handleToggle = async () => {
      setLoading(true);
      await updatePublicity(card, !value);
      setLoading(false);
    };
    
    return (
      <button 
        onClick={handleToggle}
        disabled={loading}
      >
        <div className="border-2 rounded-lg p-1 w-25">
          {loading ? (
            <h1>Updating...</h1>
          ) : value ? (
            <div className="flex justify-center items-center gap-2">
              <BsEye/>
              <h1>Public</h1>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-2">
              <BsEyeSlash/>
              <h1>Private</h1>
            </div>
          )}
        </div>
      </button>
    )
  }
  
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
    
    if (res.ok) {
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      setProfile(profileData.user);
    }
    
    setMessage(resData.message)
    await sleep(5000);
    setMessage("");
  };

  async function updatePublicity(card:number, isPublic: boolean) {
    let newValue;
    if (profile?.profilePublic) {
      newValue = [...profile.profilePublic]; // Create a copy to avoid mutation
    } else {
      newValue = [false,false,false,false]
    }
    newValue[card] = isPublic;
    
    const res = await fetch("/api/profile/update", {
      method: "POST",
      body: JSON.stringify({ section:"profilePublic", value: newValue }),
    });

    const resData = await res.json();
    
    if (res.ok) {
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      setProfile(profileData.user);
    }
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
    <div className="flex items-center justify-center h-full w-full">
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
              <input
                className="border-2 rounded-lg p-2 field-sizing-content"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={bioMaxLen}
                placeholder={"Hi, my name is "+profile.username+"!"}
              />
              <span className={clsx("text-sm text-gray-500 ml-2", 
              bio?.length==bioMaxLen && "text-red-500")}>
                {(bio? bio.length : "0") +'/'+bioMaxLen}
              </span>
              <br/>
              <Button 
              onClick={() => updateBio(bio)} 
              disabled={bio == profile.bio}
              className={clsx("text-xl font-bold w-30 ml-4 -translate-y-10 translate-x-74", 
              bio == profile.bio && "grayscale cursor-not-allowed")} 
              >
                Update Bio
              </Button>
              <div className="inline-block">
                { message? (
                  <h1 className="text-gray-500 italic">{message}</h1>
                  ):(
                  <div className="h-6"></div>
                  )
                } 
              </div>
              <hr className="my-4"></hr>
              <h1 className="my-4 ml-2 text-xl font-bold">
                {clsx("Total chips: ", profile.totalChips? profile.totalChips.toFixed(2) : "0")}
              </h1>
              <div className="flex items-center">
                <h1 className="my-4 mx-2 text-xl font-bold">Chip History:</h1>
                <PublicSwitch card={0}/>
              </div>
              <div className="h-50" ref={chartContainerRef} />
              <hr className="my-4"></hr>
              
              <div className="h-80 flex items-center gap-2 mb-4">
                <div>
                  <div className="translate-x-70 translate-y-15 w-25">
                    <PublicSwitch card={1}/>
                  </div>
                  <MostPlayedGamesChart userId={profile.id}/>
                </div>  
                <div>
                  <div className="translate-x-72 translate-y-15 w-25">
                    <PublicSwitch card={2}/>
                  </div>
                  <MostProfitableGamesChart userId={profile.id}/>
                </div> 
                <div>
                  <div className="translate-x-80 translate-y-13 w-25">
                    <PublicSwitch card={3}/>
                  </div>
                  <PublicLeaderboardPlacementChart profile={profile}/>
                </div> 
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
