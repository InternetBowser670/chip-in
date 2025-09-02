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

export default function Home() {
  return (
    <main className="relative">
      <div className="relative z-10">
        <div className="relative w-full h-screen overflow-hidden bg-background-900">
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
            <h1 className="mb-2 font-bold text-7xl">ChipIn</h1>
            <h1 className="text-4xl font-bold">Gambling without the risk</h1>
            <div className="flex justify-center gap-3 mt-20">
              <Card>Poker</Card>
              <Card>Blackjack</Card>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center w-full h-screen bg-background-800">
          <h1 className="text-3xl font-bold">Coming soon!</h1>
        </div>
      </div>
    </main>
  );
}
