import Image from "next/image";
import { motion, useAnimation } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

interface SlotRef {
    itemNum: number;
    spinning: boolean;
}

interface ReelProps {
    slotRef: SlotRef;
}

export default function Reel({ slotRef }: ReelProps) {
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

    // ensure index is within bounds
    const index = Math.min(Math.max(itemNum - 1, 0), items.length - 1);
    const bottomIndex = index === 0 ? items.length - 1 : index - 1;

    const controls = useAnimation();

    useEffect(() => {
        if (spinning) {
            controls.start({
                y: [0, 200],
                transition: { ease: 'linear', duration: 0.1, repeat: Infinity },
            });
        } else {
            controls.stop();
            controls.set({ y: 0 });
        }
    }, [spinning, controls]);

    return (
        <div className="relative w-50 h-50 overflow-hidden">
            <motion.div initial={{ y: 0 }} animate={controls}>
                <Image
                    src={items[index]}
                    width={width}
                    height={width}
                    alt="Slot"
                    className="absolute top-4 left-0 -translate-y-[200px]"
                />
                <Image
                    src={items[bottomIndex]}
                    width={width}
                    height={width}
                    alt="Slot"
                    className="absolute top-[216px] left-0 -translate-y-[200px]"
                />
            </motion.div>
        </div>
    );
}