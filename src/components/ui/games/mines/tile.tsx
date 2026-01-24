"use client";

import { AnimatePresence, motion } from "motion/react";
import { GiUnlitBomb } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";
import { FaQuestion } from "react-icons/fa";

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
        backgroundColor: flipped
          ? value === "mine"
            ? "#fb2c36"
            : "#00c951"
          : "#303236",
        boxShadow: !flipped ? "inset 0 -12px 0 rgba(255,255,255,0.15)" : "inset 0 -12px 0 rgba(255,255,255,0)",
      }}
      // hex codes come from tailwind

      whileHover={!flipped ? { y: -2, backgroundColor: "#364153" } : { y: 0 }}

      whileTap={!flipped ? { y: 4 } : {}}

      transition={{
        y: { type: "spring", stiffness: 400, damping: 30 },
        boxShadow: { duration: 0.25 },
        backgroundColor: { duration: 0.25 },
      }}
      className="w-40 h-25 rounded-md flex items-center justify-center border border-gray-300 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {flipped && value === "mine" && (
          <motion.div
            key="mine"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 15 }}
            transition={{ type: "spring", stiffness: 500, damping: 42, visualDuration: 0.8 }}
            className="text-[#101828]"
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
            transition={{ type: "spring", stiffness: 500, damping: 42, visualDuration: 0.8 }}
            className="text-[#101828]"
          >
            <IoDiamond size={40} />
          </motion.div>
        )}
        {!flipped && (
          <motion.div
            key="not-flipped"
            initial={{ scale: 0, rotate: 15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -15 }}
            transition={{ type: "spring", stiffness: 500, damping: 42, visualDuration: 0.8 }}
            className="text-white opacity-85"
          >
            <FaQuestion size={40} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
