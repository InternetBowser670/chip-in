"use client";

import { AnimatePresence, motion } from "motion/react";
import { GiUnlitBomb } from "react-icons/gi";
import { IoDiamond } from "react-icons/io5";
import { FaQuestion } from "react-icons/fa";
import { useTheme } from "next-themes";

export default function   MinesTile({
  flipped,
  value,
  queued,
}: {
  flipped: boolean;
  value?: "mine" | "safe";
  queued?: boolean;
}) {

  const { resolvedTheme } = useTheme();

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: flipped
          ? value === "mine"
            ? (resolvedTheme == "light" ? "#fb3740" : "#fb2c36")
            : (resolvedTheme == "light" ? "#05df72" : "#00c951")
          : (resolvedTheme == "light" ? "#f2fafd" : "#171925")
      }}
      // hex codes come from tailwind

      whileHover={!flipped ? { y: -2, backgroundColor: (resolvedTheme == "light" ? "#e6eef1" : "#21242d") } : { y: 0 }}
      whileTap={!flipped ? { y: 4 } : {}}
      transition={{
        y: { type: "spring", stiffness: 400, damping: 30 },
        backgroundColor: { duration: 0.25 },
      }}
      className="relative flex items-center justify-center w-full h-full overflow-hidden border rounded-md border-foreground/20"
    >
      <AnimatePresence mode="wait">
        {queued && !flipped && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 42,
              visualDuration: 0,
            }}
            className="absolute flex items-center justify-center w-3 h-3 top-3 right-3"
          >
            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-400"></span>
            <span className="relative inline-flex rounded-full size-2 bg-sky-500"></span>
          </motion.div>
        )}
        {flipped && value === "mine" && (
          <motion.div
            key="mine"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 15 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 42,
              visualDuration: 0,
            }}
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
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 42,
              visualDuration: 0,
            }}
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
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 42,
              visualDuration: 0,
            }}
            className="opacity-85"
          >
            <FaQuestion size={40} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
