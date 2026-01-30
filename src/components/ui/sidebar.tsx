"use client";

import OpenAdminDash from "@/components/ui/admin/open-admin-dash";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import ModeToggle from "@/components/ui/theme-switcher";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ClaimChips from "@/components/ui/global/claim-chips";
import ChipCount from "@/components/ui/global/chip-count";
import UserOptions from "./user-options";
import { useRouter } from "next/navigation";
import { Separator } from "./separator";

export default function Sidebar() {
  const router = useRouter();

  return (
    <>
      <div className="w-50 h-full! bg-card border-r border-r-foreground/30">
        <div className="flex flex-col items-center justify-between h-full">
          <div className="flex flex-col items-center mx-2 mt-2">
            <div className="flex flex-col items-center">
              <Link href={"/"} className="flex justify-center">
                <Image
                  src={"/chip-in-logo.png"}
                  width={50}
                  height={50}
                  alt="Chip In logo"
                />
                <p className="flex items-center text-lg!">ChipIn</p>
              </Link>
              <ClaimChips />
              <ChipCount />
              <ButtonGroup className="my-4">
                <Button
                  onClick={() => redirect("/dashboard")}
                  variant={"outline"}
                >
                  Dashboard
                </Button>
                <ModeToggle />
              </ButtonGroup>
            </div>
            <Separator />
            <div className="flex flex-col w-full gap-4 mx-2 mt-2 text-left">
              <p className="text-xl font-bold">Games:</p>
              <Button
                variant={"ghost"}
                onClick={() => {
                  router.push("/play/coinflip");
                }}
                className="flex items-center justify-start gap-2 text-start"
              >
                <p>Coinflip</p>
              </Button>
              <Button
                variant={"ghost"}
                onClick={() => {
                  router.push("/play/blackjack");
                }}
                className="flex items-center justify-start gap-2 text-start"
              >
                <p>Blackjack</p>
              </Button>
              <Button
                variant={"ghost"}
                onClick={() => {
                  router.push("/play/mines");
                }}
                className="flex items-center justify-start gap-2 text-start"
              >
                <p>Mines</p>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center w-full mb-4 overflow-x-hidden">
            <OpenAdminDash small />
            <UserOptions />
          </div>
        </div>
      </div>
    </>
  );
}
