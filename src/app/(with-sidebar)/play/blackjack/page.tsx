"use client";

import PlayingCard from "@/components/ui/games/any/card";
import { PrimaryButton } from "@/components/ui/global/buttons";
import { motion } from "motion/react";
import { useState } from "react";

export default function BlackjackPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="h-[80%] w-[90%] bg-gray-700 rounded-2xl text-center overflow-auto flex">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: !sidebarExpanded ? "30%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`h-full p-4 rounded-r-2xl bg-background-700 ${
            sidebarExpanded ? "w-full" : "w-16"
          }`}
        >
          <div className="flex flex-col h-full items-center">
            <h1 className="mx-2 text-5xl font-bold">Blackjack</h1>
            <div className="flex-1 flex items-center justify-center w-full">
              <PrimaryButton onClick={() => setSidebarExpanded(!sidebarExpanded)} text="Toggle Sidebar" />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: !sidebarExpanded ? "70%" : "0%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex items-center justify-center flex-1 h-full "
        >
          <div className="relative flex flex-1 h-full overflow-hidden">
            <div className="relative flex items-center justify-center w-full h-full">
              <div className="flex flex-col items-center">
                <PlayingCard suit="hearts" rank="A" width={56} />
                <p className="mt-2 text-4xl font-bold">Coming Soon!</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
