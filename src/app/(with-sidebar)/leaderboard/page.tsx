import MostChipsLeaderboardCard from "@/components/ui/stats/leaderboards/most-chips-leaderboard-card";

export default function LeaderboardPage() {
  return (
    <>
      <div className="flex flex-col items-center w-full h-screen">
        <h1 className="m-8 font-bold text-center text-7xl">Leaderboard</h1>
        <div className="flex flex-col items-center w-full max-h-3/4">
          <div className="flex flex-col items-center flex-1 w-full max-h-full">
            <div className="max-w-[80%] max-h-[80%] my-2">
              <MostChipsLeaderboardCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
