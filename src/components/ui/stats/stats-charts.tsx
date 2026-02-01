"use client";

import { useEffect, useState } from "react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card } from "../card";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

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
        { game: "Coinflip", value: json.user.coinFlipCount },
        { game: "Blackjack", value: json.user.blackjackCount },
        { game: "Mines", value: json.user.minesCount },
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
    <Card className="w-99">
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
        { game: "Coinflip", value: json.user.coinFlipProfit },
        { game: "Blackjack", value: json.user.blackjackProfit },
        { game: "Mines", value: json.user.minesProfit },
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
    <Card className="w-99">
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
