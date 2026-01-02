"use client";

import PlayingCard from "@/components/ui/games/any/card";

export default function BlackjackPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="h-[80%] w-[90%] bg-gray-700 rounded-2xl text-center overflow-auto flex">
        <div className="w-auto h-full p-4 rounded-r-2xl bg-background-700">
          <div className="flex flex-col items-center">
            <h1 className="mx-2 text-5xl font-bold">Blackjack</h1>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 h-full over">
          <div className="relative flex flex-1 h-full overflow-hidden">
            <div className="relative flex items-center justify-center w-full h-full">
              <div className="flex flex-col items-center">
                <PlayingCard suit="hearts" rank="A" width={56} />
                <p className="mt-2 text-4xl font-bold">Coming Soon!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
