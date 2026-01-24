"use client";

import { PrimaryButton } from "@/components/ui/global/buttons";
import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import MinesTile from "@/components/ui/games/mines/tile";

export default function MinesPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  const [mineState, setMineState] = useState<false | "safe" | "mine">(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={containerRef}
        className="h-[80%] w-[90%] bg-gray-800 rounded-2xl text-center overflow-auto flex"
      >
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: !sidebarExpanded ? "30%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`h-full p-4 rounded-r-2xl bg-background-700 ${
            sidebarExpanded ? "w-full" : "w-16"
          }`}
        >
          <div className="flex flex-col h-full items-center">
            <h1 className="mx-2 text-5xl font-bold">Mines</h1>
            <div className="flex-1 flex items-center justify-center w-full">
              <PrimaryButton
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                text="Toggle Sidebar"
              />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: !sidebarExpanded ? "70%" : "0%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex items-center justify-center flex-1 h-full overflow-hidden"
        >
          <div
            className="h-full"
            style={{
              width: (containerWidth * 7) / 10,
              minWidth: (containerWidth * 7) / 10,
            }}
          >
            <div className="relative flex flex-1 h-full overflow-hidden">
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-center">
                  <button type="button" className="m-2" onClick={() => setMineState(mineState == "safe" ? "mine" : mineState == "mine" ? false : "safe")}>
                    <MinesTile flipped={mineState == false ? false : true} value={mineState !== false ? mineState : undefined} />
                  </button>
                  <p className="mt-2 text-4xl font-bold">Coming Soon!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
