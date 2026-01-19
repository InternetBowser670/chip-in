"use client";

import { motion } from "motion/react";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function ScrollDown() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        <p className="text-center align-middle text-3xl">More Info</p>
        <motion.div
          animate={{ y: [-4, 6, -4] }}
          className="flex justify-center items-center"
          transition={{
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            duration: 2,
          }}
        >
          <MdKeyboardArrowDown size={50} />
          <MdKeyboardArrowDown size={50} />
          <MdKeyboardArrowDown size={50} />
        </motion.div>
      </div>
    </div>
  );  
}
