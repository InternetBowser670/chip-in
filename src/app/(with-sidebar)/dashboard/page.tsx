"use client";

import { useRouter } from "next/navigation";
import {
  GiCardJackSpades,
  GiCoinflip,
  GiPerspectiveDiceSixFacesSix,
  GiUnlitBomb,
} from "react-icons/gi";
import OpenAdminDash from "@/components/ui/admin/open-admin-dash";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MostPlayedGamesChart,
  MostProfitableGamesChart,
} from "@/components/ui/stats/stats-charts";
import { useLiveUsers } from "@/components/providers";
import Ping from "@/components/ui/global/ping";
import { FaUser } from "react-icons/fa";

export default function Page() {
  const router = useRouter();

  const { mines, blackjack, coinflip } = useLiveUsers();

  return (
    <>
      <div className="flex flex-col items-center w-full h-full gap-4 overflow-auto overflow-y-auto">
        <div className="min-w-full p-2 pl-4 bg-card border-foreground/30">
          <h2 className="pb-2 text-3xl font-bold">Games:</h2>
          <div className="flex gap-2">
            <Card className="p-4 mx-2">
              <div className="flex justify-center">
                <GiCoinflip size="70" />
              </div>
              <CardContent>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Coinflip
                </CardTitle>
                <div className="flex items-center justify-center w-full gap-2">
                  <Ping />
                  <FaUser />
                  <p>Live users:</p>
                  {coinflip}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => router.push("/play/coinflip")}
                  className="w-full"
                >
                  Play now!
                </Button>
              </CardFooter>
            </Card>
            <Card className="p-4 mx-2">
              <div className="flex justify-center">
                <GiCardJackSpades size="70" />
              </div>
              <CardContent>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Blackjack
                </CardTitle>
                <div className="flex items-center justify-center w-full gap-2">
                  <Ping />
                  <FaUser />
                  <p>Live users:</p>
                  {blackjack}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => router.push("/play/blackjack")}
                  className="w-full"
                >
                  Play now!
                </Button>
              </CardFooter>
            </Card>
            <Card className="p-4 mx-2">
              <div className="flex justify-center">
                <GiUnlitBomb size="70" />
              </div>
              <CardContent>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Mines
                </CardTitle>
                <div className="flex items-center justify-center w-full gap-2">
                  <Ping />
                  <FaUser />
                  <p>Live users:</p>
                  {mines}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => router.push("/play/mines")}
                  className="w-full"
                >
                  Play now!
                </Button>
              </CardFooter>
            </Card>
            <Card className="p-4 mx-2">
              <div className="flex justify-center">
                <GiPerspectiveDiceSixFacesSix size="70" />
              </div>
              <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                And More...
              </CardTitle>
              <CardFooter>
                <Button disabled className="w-full">
                  Coming soon!
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="min-w-full p-2 pl-4 bg-card border-foreground/30">
          <h2 className="pb-2 text-3xl font-bold">Statistics:</h2>
          <div className="flex gap-4">
            <MostPlayedGamesChart />
            <MostProfitableGamesChart />
          </div>
          <p className="p-2 italic">Hover for exact numbers</p>
        </div>
        <div className="flex justify-center p-2 mt-4 ">
          <OpenAdminDash />
        </div>
      </div>
    </>
  );
}
