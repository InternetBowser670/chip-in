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
import GlobalUserCount from "./global/global-user-count";
import ChatModal from "./chat/chat-modal";
import { NativeBannerAd } from "./global/ads";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function Sidebar() {
  const router = useRouter();

  return (
    <>
      <div className="w-50 h-full! bg-card border-r border-r-foreground/30">
        <div className="flex flex-col items-center justify-between h-full">
          <div className="flex flex-col items-center mx-2 mt-2">
            <div className="flex flex-col items-center gap-4 mb-4">
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
              <ButtonGroup>
                <Button
                  onClick={() => redirect("/dashboard")}
                  variant={"outline"}
                >
                  Dashboard
                </Button>
                <ModeToggle />
              </ButtonGroup>
              <GlobalUserCount />
              <ChatModal />
            </div>
            <Separator />
            <div className="flex flex-col w-full gap-2 mx-2 my-2 text-left">
              <p className="text-xl font-bold">Games:</p>
              <Button
                variant={"ghost"}
                onClick={() => {
                  router.push("/play/coinflip");
                }}
                className={clsx(
                  "flex items-center justify-start gap-2 text-start",
                  {
                    "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4":
                      usePathname() === "/play/coinflip",
                  },
                )}
              >
                <p>Coinflip</p>
              </Button>
              <Button
                variant={"ghost"}
                onClick={() => {
                  router.push("/play/blackjack");
                }}
                className={clsx(
                  "flex items-center justify-start gap-2 text-start",
                  {
                    "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4":
                      usePathname() === "/play/blackjack",
                  },
                )}
              >
                <p>Blackjack</p>
              </Button>
              <Button
                variant={"ghost"}
                onClick={() => {
                  router.push("/play/mines");
                }}
                className={clsx(
                  "flex items-center justify-start gap-2 text-start",
                  {
                    "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4":
                      usePathname() === "/play/mines",
                  },
                )}
              >
                <p>Mines</p>
              </Button>
            </div>
            <Separator />
            <div className="flex flex-col w-full gap-2 mx-2 my-2 text-left">
              <p className="text-xl font-bold">Other:</p>
              <Button
                variant={"ghost"}
                onClick={() => {
                  router.push("/leaderboard");
                }}
                className={clsx(
                  "flex items-center justify-start gap-2 text-start",
                  {
                    "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4":
                      usePathname() === "/leaderboard",
                  },
                )}
              >
                <p>Leaderboard</p>
              </Button>
            </div>
            <Separator />
            <NativeBannerAd />
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
