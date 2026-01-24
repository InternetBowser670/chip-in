"use client";

import { AnimatePresence, motion } from "motion/react";
import { GiUnlitBomb } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";

export default function MinesTile({
  flipped,
  value,
}: {
  flipped: boolean;
  value?: "mine" | "safe";
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: flipped ? "#101828" : "#303236",
        boxShadow: !flipped ? "inset 0 -16px 0 rgba(255,255,255,0.15)" : "",
      }}

      // hex codes come from tailwind

      whileHover={{ y: !flipped ? -2 : 0, backgroundColor: !flipped ? "#484b51" : "#101828" }}

      transition={{
        y: { type: "spring", stiffness: 400, damping: 30 },
        boxShadow: { duration: 0.25 },
        backgroundColor: { duration: 0.25 },
      }}
      className="w-40 h-25 rounded-md flex items-center justify-center border border-gray-300 bg-background-700"
    >
      <AnimatePresence mode="wait">
        {flipped && value === "mine" && (
          <motion.div
            key="mine"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 15 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="text-red-500"
          >
            <GiUnlitBomb size={40} />
          </motion.div>
        )}

        {flipped && value === "safe" && (
          <motion.div
            key="safe"
            initial={{ scale: 0, rotate: 15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -15 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="text-green-500"
          >
            <IoDiamond size={40} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
