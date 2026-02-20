'use client';
import { motion } from "motion/react";
import { useState } from "react";
import { useChips } from "@/components/providers";
import { PiPokerChip } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { BannerAd } from "@/components/ui/global/ads";
import { Field } from "@/components/ui/field";

export default function Page(){
  const { chips, setChips, chipsFetched } = useChips();
  
  const [betAmt, setBetAmt] = useState<number | null>(null);
  const [extendSidebar, setExtendSidebar] = useState(true);
  const [slotsSpinning, setSlotSpinning] = useState<boolean>(false);
  
  async function handleSpin() {
    console.log("K ur spinning")
  }
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex overflow-hidden text-center h-[80vh] w-[80%]! flex-row py-0 bg-background border rounded-2xl">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: !extendSidebar ? "40%" : "100%" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="h-full p-4 border-r bg-card rounded-r-2xl"
        >
          <div className="h-full">
            <motion.h1 className="text-5xl font-bold">Slots</motion.h1>
            <br />
            <div className="flex justify-center w-full">
              <motion.div
                className="flex justify-center mt-6"
                initial={{ width: "40%" }}
                animate={{ width: !extendSidebar ? "100%" : "40%" }}
              >
                <Field
                  className="flex flex-row justify-center w-full"
                  data-invalid={
                    chipsFetched &&
                    betAmt &&
                    (betAmt > chips || betAmt < 0 || !Number.isInteger(betAmt))
                  }
                >
                  <InputGroup>
                    <InputGroupInput
                      title="bet"
                      value={betAmt || ""}
                      onChange={(e) =>
                        setBetAmt(parseInt(e.target.value) || null)
                      }
                      placeholder="Bet Amount"
                      type="text"
                    />
                    <InputGroupAddon align={"inline-end"}>
                      <PiPokerChip />
                      <InputGroupButton
                        variant={"outline"}
                        className="flex items-center justify-center text-center text-foreground"
                        onClick={() => setBetAmt(betAmt && betAmt * 2)}
                      >
                        x2
                      </InputGroupButton>
                      <InputGroupButton
                        variant={"outline"}
                        className="flex items-center justify-center text-center text-foreground"
                        onClick={() => setBetAmt(betAmt && betAmt / 2)}
                      >
                        /2
                      </InputGroupButton>
                      <InputGroupButton
                        variant={"outline"}
                        className="flex items-center justify-center text-center text-foreground"
                        onClick={() => setBetAmt(Math.floor(chips))}
                      >
                        All In
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </motion.div>
            </div>
            <div className="flex items-center justify-center mt-4 gap-15">
              <Button
                variant={"default"}
                onClick={() =>
                !slotsSpinning &&
                handleSpin()
                }
              >
                Spin
              </Button>
        </div>
          </div>
        </motion.div>
      </div>
    </div>
    )
}