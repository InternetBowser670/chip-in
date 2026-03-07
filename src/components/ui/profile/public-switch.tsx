import { motion } from "motion/react";

export default function PublicSwitch({value}:{value:boolean}) {
  return (
   <>
    <div className="bg-gray-700 p-2 rounded-full">
      Private Public
    </div>
    <motion.div
      initial={{}}
      animate={{textDecorationColor: "red-500"}}
    >
      Hi
    </motion.div>
   </>
  );
}
