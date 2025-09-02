"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import GlowBg from "@/components/ui/backgrounds/glow-bg";
import Card from "@/components/ui/global/card";
import { GiPokerHand, GiCardJackClubs, GiCoinflip, GiLandMine } from "react-icons/gi";
import { RxColorWheel } from "react-icons/rx";
import Marquee from "react-fast-marquee";
import { PiJoystickLight } from "react-icons/pi";

export default function Home() {
  return (
    <main className="relative">
      <div className="relative z-10">
        <div className="relative w-full h-screen pb-2 overflow-hidden bg-background-900">
          <GlowBg />
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
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <button
                    type="button"
                    className="p-2 text-sm font-medium rounded-full cursor-pointer bg-primary-700 sm:text-base sm:px-5"
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <div className="relative z-30 flex flex-col items-center justify-center w-full h-full mb-20">
            <h1 className="mb-8 font-bold text-7xl">ChipIn</h1>
            <h1 className="px-4 text-4xl font-bold">Gambling without the risk</h1>
            <Marquee autoFill pauseOnHover gradient gradientColor="rgb(24, 25, 27)" className="flex justify-center mt-20">
              <Card color="red" className="mx-2">
                <h1 className="mb-2 text-3xl text-red-400">Poker</h1>
                <div className="flex justify-center">
                  <GiPokerHand size="70" className="text-red-400" />
                </div>
              </Card>
              <Card color="orange" className="mx-2">
                <h1 className="mb-2 text-3xl text-orange-400">Blackjack</h1>
                <div className="flex justify-center">
                  <GiCardJackClubs size="70" className="text-orange-400" />
                </div>
              </Card>
              <Card color="yellow" className="mx-2">
                <h1 className="mb-2 text-3xl text-yellow-400">Coinflip</h1>
                <div className="flex justify-center">
                  <GiCoinflip size="70" className="text-yellow-400" />
                </div>
              </Card>
              <Card className="mx-2">
                <h1 className="mb-2 text-3xl text-primary-400">Roulette</h1>
                <div className="flex justify-center">
                  <RxColorWheel size="70" className="text-primary-400" />
                </div>
              </Card>
              <Card color="blue" className="mx-2">
                <h1 className="mb-2 text-3xl text-blue-400">Mines</h1>
                <div className="flex justify-center">
                  <GiLandMine size="70" className="text-blue-400" />
                </div>
              </Card>
              <Card color="purple" className="mx-2">
                <h1 className="mb-2 text-3xl text-purple-400">Slots</h1>
                <div className="flex justify-center">
                  <PiJoystickLight size="70" className="text-purple-400" />
                </div>
              </Card>
            </Marquee>
            <h1 className="px-4 mt-10 text-xl font-bold">All of these games and more, without ever having to spend a penny!</h1>
          </div>
        </div>

        <div className="flex items-center justify-center w-full h-screen bg-background-800">
          <h1 className="text-3xl font-bold">Coming soon!</h1>
        </div>
      </div>
    </main>
  );
}
