"use client";

import {
  ClerkLoading,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import {
  GiPokerHand,
  GiCardJackSpades,
  GiCoinflip,
  GiPerspectiveDiceSixFacesSix,
  GiUnlitBomb,
} from "react-icons/gi";
import { RxColorWheel } from "react-icons/rx";
import { PiJoystickLight } from "react-icons/pi";
import ScrollDown from "@/components/ui/global/scroll-indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ModeToggle from "@/components/ui/theme-switcher";
import ColorBends from "@/components/ColorBends";
import GlassSurface from "@/components/GlassSurface";

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative w-screen h-screen overflow-x-hidden">
      <div className="relative z-10">
        <div className="relative w-full h-screen overflow-hidden">
          <header className="fixed flex justify-center w-full top-2 z-100 h-fit!">
            <GlassSurface
              width={"90%"}
              backgroundOpacity={0.1}
              className="fixed z-50 flex items-center justify-between w-full px-2 py-2 border-b h-fit border-b-background-700"
              height={"fit"}
            >
              <div className="flex items-center justify-between w-full h-fit">
                <div className="flex items-center gap-2">
                  <Image
                    src={"/chip-in-logo.png"}
                    width={30}
                    height={30}
                    alt="Chip In logo"
                  />
                  <p className="text-lg font-bold">ChipIn</p>
                </div>
                <div className="flex items-center gap-4">
                  <ModeToggle />
                  <ClerkLoading>Loading user...</ClerkLoading>
                  <SignedOut>
                    <SignInButton />
                    <SignUpButton>
                      <button
                        type="button"
                        className="px-2 py-1 m-2 text-sm font-medium transition-all border-2 border-b-4 cursor-pointer rounded-2xl bg-accent-900 sm:text-base sm:px-5 border-accent-400 hover:bg-accent-800"
                      >
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Button
                      variant={"default"}
                      onClick={() => router.push("/dashboard")}
                    >
                      Dashboard
                    </Button>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </GlassSurface>
          </header>
          <ColorBends className="absolute -z-1" />
          <div className="absolute top-0 z-30 flex flex-col items-center justify-center w-full h-full mb-20">
            <h1 className="mb-8 font-bold text-7xl">ChipIn</h1>
            <h1 className="px-4 text-4xl font-bold">
              Gambling without the risk
            </h1>
            <div className="flex items-center justify-center mt-20">
              <Card className="p-4 mx-2">
                <div className="flex justify-center">
                  <GiPokerHand size="70" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Poker
                </CardTitle>
                <CardFooter>
                  <Button className="w-full" disabled>
                    Coming Soon!
                  </Button>
                </CardFooter>
              </Card>

              <Card className="p-4 mx-2">
                <div className="flex justify-center">
                  <GiCardJackSpades size="70" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Blackjack
                </CardTitle>
                <CardFooter>
                  <Button
                    onClick={() => router.push("/play/blackjack")}
                    className="w-full"
                  >
                    Play now!
                  </Button>
                </CardFooter>
              </Card>

              <Card className="p-4 mx-2">
                <div className="flex justify-center">
                  <GiCoinflip size="70" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Coinflip
                </CardTitle>
                <CardFooter>
                  <Button
                    onClick={() => router.push("/play/coinflip")}
                    className="w-full"
                  >
                    Play now!
                  </Button>
                </CardFooter>
              </Card>

              <Card className="p-4 mx-2">
                <div className="flex justify-center">
                  <RxColorWheel size="70" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Roulette
                </CardTitle>
                <CardFooter>
                  <Button disabled className="w-full">
                    Coming soon!
                  </Button>
                </CardFooter>
              </Card>

              <Card className="p-4 mx-2">
                <div className="flex justify-center">
                  <GiUnlitBomb size="70" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Mines
                </CardTitle>
                <CardFooter>
                  <Button
                    onClick={() => router.push("/play/mines")}
                    className="w-full"
                  >
                    Play now!
                  </Button>
                </CardFooter>
              </Card>

              <Card className="p-4 mx-2">
                <div className="flex justify-center">
                  <PiJoystickLight size="70" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  Slots
                </CardTitle>
                <CardFooter>
                  <Button disabled className="w-full">
                    Coming soon!
                  </Button>
                </CardFooter>
              </Card>

              <Card className="p-4 mx-2">
                <div className="flex justify-center">
                  <GiPerspectiveDiceSixFacesSix size="70" />
                </div>
                <CardTitle className="text-4xl font-extrabold tracking-tight text-center scroll-m-20 text-balance">
                  And More...
                </CardTitle>
                <CardFooter>
                  <Button disabled className="w-full">
                    Coming soon!
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <h1 className="px-4 mt-10 text-xl font-bold">
              No-stakes gambling with all the thrill!
            </h1>
            <div className="mt-[5%]">
              <ScrollDown />
            </div>
            <Card className="absolute p-2 px-4 bottom-2 right-2">
              <span>
                <Link className="underline" href={"https://internetbowser.com"}>
                  InternetBowser
                </Link>, 2025
              </span>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-center w-full h-screen bg-zinc-100 dark:bg-zinc-900">
          <h1 className="text-3xl font-bold">
            To start playing, create an account, claim your daily chips and
            navigate to a game.
          </h1>
        </div>
      </div>
    </main>
  );
}
