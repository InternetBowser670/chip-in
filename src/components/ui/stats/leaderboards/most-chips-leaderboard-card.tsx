"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../avatar";
import { Card } from "../../card";
import { PiPokerChip } from "react-icons/pi";

function UserCard({
  username,
  chips,
  imageUrl,
  index,
}: {
  username: string;
  chips: number;
  imageUrl: string;
  index: number;
}) {
  return (
    <div className="flex items-center w-full gap-4">
      #{index + 1}
      <Card className="w-full p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={imageUrl} />
            <AvatarFallback />
          </Avatar>
          <div className="relative flex-1 overflow-hidden">
            <div className="whitespace-nowrap mask-[linear-gradient(to_right,black_80%,transparent_100%)]">
              {username}
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
  );
}

export default function MostChipsLeaderboardCard() {
  const [userCounts, setUserCounts] = useState<
    { userId: string; chipCount: number; username: string; imageUrl: string }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/get-users", { method: "POST" });
      const data = await res.json();
      setUserCounts(
        data.users
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((u: any) => ({
            userId: u.id,
            username: u.username,
            chipCount: +(u.totalChips || 0),
            imageUrl: u.image_url,
          }))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => b.chipCount - a.chipCount),
      );
    }
    fetchData();
  }, []);

  return (
    <Card className="flex flex-col items-center justify-center h-full p-8">
      <div className="flex items-center justify-center">
        <h2 className="text-2xl font-bold text-center">Most Chips</h2>
      </div>
      {userCounts && userCounts.length > 0 ? (
        <div className="flex flex-col items-start gap-2 p-2 overflow-y-auto">
          {userCounts.map((u, i) => (
            <UserCard
              key={u.userId}
              index={i}
              username={u.username}
              chips={u.chipCount}
              imageUrl={u.imageUrl}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">Loading...</div>
      )}
    </Card>
  );
}
