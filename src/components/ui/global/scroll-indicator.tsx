"use client";

import { motion } from "motion/react";
import { Card } from "../card";

export default function ScrollDown() {
  return (
    <motion.div
      animate={{ y: [-4, 6, -4] }}
      className="flex items-center justify-center"
      transition={{
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        duration: 2,
      }}
    >
      <Card className="flex items-center justify-center py-4d! px-4">
        <p className="text-2xl font-bold">Scroll Down</p>
      </Card>
    </motion.div>
  );
}
