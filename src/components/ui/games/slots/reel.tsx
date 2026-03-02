import Image from "next/image";
import { motion, useAnimation } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { sleep } from "@/lib/sleep";

interface SlotRef {
    itemNum: number;
    spinning: boolean;
}

interface ReelProps {
    slotRef: SlotRef;
    speed: number;
}

export default function Reel({ slotRef, speed }: ReelProps) {
    const { itemNum, spinning } = slotRef;
    const width = 200;

    const { theme, resolvedTheme } = useTheme();
    const currentTheme = resolvedTheme || theme;

    
    const items = [
        '/slots/seven.png',
        //Change bar between black and white depending on theme
        currentTheme === 'dark' ? '/slots/whitebar.png' : '/slots/blackbar.png',
        '/slots/gem.png',
        '/slots/clover.png',
        '/slots/bell.png',
    ];
    
    const index = Math.min(Math.max(itemNum - 1, 0), items.length - 1);
    const bottomIndex = index === 0 ? items.length - 1 : index - 1;
    
    const [item1Num, setItem1Num] = useState<number>(index);
    const [item2Num, setItem2Num] = useState<number>(bottomIndex);

    const controls1 = useAnimation();
    const controls2 = useAnimation();
    
    useEffect(() => {
        if (spinning) {
        controls2.start({
            y: [0, 200],
            transition: {duration: speed, ease: 'linear', }
        });
        controls1.start({
            y: [0, 200],
            transition: {duration: speed, ease: 'linear', }
        });
        setItem2Num(index);
        setItem1Num(bottomIndex);
        }

    }, [spinning, speed, sleep, controls1, controls2, index, bottomIndex]);

    return (
        <div className="relative w-50 h-50 overflow-hidden">
            <motion.div initial={{ y: 0 }} animate={controls1}>
                <Image
                    src={items[item1Num]}
                    width={width}
                    height={width}
                    alt="Slot"
                    className="absolute top-4 left-0 "
                />
            </motion.div>
            <motion.div initial={{ y: 0 }} animate={controls2}>
                <Image
                    src={items[item2Num]}
                    width={width}
                    height={width}
                    alt="Slot"
                    className="absolute top-4 left-0 -translate-y-[200px]"
                />
            </motion.div>
        </div>
    );
}