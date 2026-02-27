"use client";

import { useEffect, useState } from "react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardFooter } from "../card";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useUser } from "@clerk/nextjs";
import { Button } from "../button";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { PiPokerChip } from "react-icons/pi";
import { useChips } from "@/components/providers";
import { IoArrowForwardOutline } from "react-icons/io5";

export function MostPlayedGamesChart() {
  const [chartData, setChartData] = useState<{ game: string; value: number }[]>(
    [
      { game: "Coinflip", value: 0 },
      { game: "Blackjack", value: 0 },
      { game: "Mines", value: 0 },
    ],
  );

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/profile");
      const json = await res.json();

      setChartData([
        { game: "Coinflip", value: json.user.coinFlipCount ?? 0 },
        { game: "Blackjack", value: json.user.blackjackCount ?? 0 },
        { game: "Mines", value: json.user.minesCount ?? 0 },
      ]);
    }
    fetchData();
  }, []);

  const chartConfig = {
    value: {
      label: "Plays",
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-full w-99">
      <h2 className="ml-2 text-2xl font-bold">Your most played games:</h2>
      <ChartContainer config={chartConfig} className="min-h-5">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="game"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}

export function MostProfitableGamesChart() {
  const [chartData, setChartData] = useState<{ game: string; value: number }[]>(
    [
      { game: "Coinflip", value: 0 },
      { game: "Blackjack", value: 0 },
      { game: "Mines", value: 0 },
    ],
  );

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/profile");
      const json = await res.json();

      setChartData([
        { game: "Coinflip", value: json.user.coinFlipProfit ?? 0 },
        { game: "Blackjack", value: json.user.blackjackProfit ?? 0 },
        { game: "Mines", value: json.user.minesProfit ?? 0 },
      ]);
    }
    fetchData();
  }, []);

  const chartConfig = {
    value: {
      label: "Amount Earned",
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-full w-99">
      <h2 className="ml-2 text-2xl font-bold">Your most profitable games:</h2>
      <ChartContainer config={chartConfig} className="min-h-5">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="game"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}

export function UserLeaderboardPlacementChart() {
  const { user } = useUser();
  const [placement, setPlacement] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const router = useRouter();

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

      setTotalUsers(users.length);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = users.findIndex((u: any) => u.userId === user?.id);

      if (index !== -1) {
        setPlacement(index + 1);
      }
    }

    if (user?.id) {
      fetchLeaderboard();
    }
  }, [user?.id]);

  const { chips } = useChips();

  return (
    <Card className="flex flex-col justify-between h-full p-4 w-99">
      <div>
        <h2 className="text-2xl font-bold">Your Leaderboard Placement</h2>

        {placement !== null ? (
          <p className="mb-2 text-sm text-muted-foreground">
            You are ranked #{placement} out of {totalUsers}
          </p>
        ) : (
          <p className="mb-2 text-sm text-muted-foreground">
            Loading placement...
          </p>
        )}

        <div className="flex items-center justify-center w-full h-full">
          <Card className="w-full p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback />
              </Avatar>
              <div className="relative flex-1 overflow-hidden">
                <div className="whitespace-nowrap mask-[linear-gradient(to_right,black_80%,transparent_100%)]">
                  {user?.username}
                </div>
                <div className="whitespace-nowrap gap-2 flex items-center mask-[linear-gradient(to_right,black_80%,transparent_100%)]">
                  <PiPokerChip />
                  {new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                    maximumFractionDigits: 1,
                  }).format(chips)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <CardFooter className="flex items-center justify-center">
        <Button onClick={() => router.push("/leaderboards")}>
          View Full Leaderboard <IoArrowForwardOutline />
        </Button>
      </CardFooter>
    </Card>
  );
}
