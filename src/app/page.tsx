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
import Card from "@/components/ui/global/card";
import {
  GiPokerHand,
  GiCardJackSpades,
  GiCoinflip,
  GiLandMine,
  GiPerspectiveDiceSixFacesSix,
} from "react-icons/gi";
import { RxColorWheel } from "react-icons/rx";
import { PiJoystickLight } from "react-icons/pi";
import ScrollDown from "@/components/ui/global/scroll-indicator";
import { useRouter } from "next/navigation";
import { PrimaryButtonChildren } from "@/components/ui/global/buttons";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative w-screen h-screen overflow-x-hidden">
      <div className="relative z-10">
        <div className="relative w-full h-screen pb-2 overflow-hidden bg-background-900">
          <header className="relative w-full h-[50px] flex items-center bg-background-800 px-2 justify-between py-2 border-b border-b-background-700 z-20">
            <div className="flex items-center gap-2">
              <Image
                src={"/chip-in-logo.png"}
                width={30}
                height={30}
                alt="Chip In logo"
              />
              <p className="text-lg font-bold">ChipIn</p>
            </div>
            <div className="flex items-center gap-4 py-2">
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
                <PrimaryButtonChildren
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </PrimaryButtonChildren>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <div className="relative z-30 flex flex-col items-center justify-center w-full h-full mb-20">
            <h1 className="mb-8 font-bold text-7xl">ChipIn</h1>
            <h1 className="px-4 text-4xl font-bold">
              Gambling without the risk
            </h1>
            <div className="flex items-center justify-center mt-20">
              <Card chin color="grayscale" className="mx-2 grayscale">
                <h1 className="mb-2 text-3xl text-red-400">Poker</h1>
                <div className="flex justify-center">
                  <GiPokerHand size="70" className="text-red-400" />
                </div>
              </Card>
              <Card chin color="grayscale" className="mx-2 grayscale">
                <h1 className="mb-2 text-3xl text-orange-400">Blackjack</h1>
                <div className="flex justify-center">
                  <GiCardJackSpades size="70" className="text-orange-400" />
                </div>
              </Card>
              <Link href="/play/coinflip">
                <Card chin color="yellow" className="mx-2">
                  <h1 className="mb-2 text-3xl text-yellow-400">Coinflip</h1>
                  <div className="flex justify-center">
                    <GiCoinflip size="70" className="text-yellow-400" />
                  </div>
                </Card>
              </Link>
              <Card chin color="grayscale" className="mx-2 grayscale">
                <h1 className="mb-2 text-3xl text-primary-400">Roulette</h1>
                <div className="flex justify-center">
                  <RxColorWheel size="70" className="text-primary-400" />
                </div>
              </Card>
              <Card chin color="grayscale" className="mx-2 grayscale">
                <h1 className="mb-2 text-3xl text-blue-400">Mines</h1>
                <div className="flex justify-center">
                  <GiLandMine size="70" className="text-blue-400" />
                </div>
              </Card>
              <Card chin color="grayscale" className="mx-2 grayscale">
                <h1 className="mb-2 text-3xl text-purple-400">Slots</h1>
                <div className="flex justify-center">
                  <PiJoystickLight size="70" className="text-purple-400" />
                </div>
              </Card>
              <Card chin color="grayscale" className="mx-2 grayscale">
                <h1 className="mb-2 text-3xl text-red-400">And More!</h1>
                <div className="flex justify-center">
                  <GiPerspectiveDiceSixFacesSix
                    size="70"
                    className="text-red-400"
                  />
                </div>
              </Card>
            </div>
            <h1 className="px-4 mt-10 text-xl font-bold">
              Roll the reels, deal the cards, and chase that jackpot thrill!
            </h1>
          </div>
          <ScrollDown />
        </div>

        <div className="flex items-center justify-center w-full h-screen bg-background-800">
          <h1 className="text-3xl font-bold">Coming soon!</h1>
        </div>
      </div>
    </main>
  );
}
