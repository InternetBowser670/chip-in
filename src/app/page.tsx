/* eslint-disable @next/next/no-img-element */
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
import { Card } from "@/components/ui/card";
import ScrollDown from "@/components/ui/global/scroll-indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ModeToggle from "@/components/ui/theme-switcher";
import Particles from "@/components/Particles";
import CardSwap, { Card as CardSwapCard } from "@/components/CardSwap";
import SplitText from "@/components/SplitText";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import GlassSurface from "@/components/GlassSurface";
import clsx from "clsx";

export default function Home() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { resolvedTheme } = useTheme();

  return (
    <main className="relative w-screen h-screen overflow-x-hidden">
      <div className="relative z-10">
        <div className="relative w-full h-screen overflow-hidden">
          <header className="fixed flex justify-center w-full top-2 z-100 h-fit!">
            {mounted && (
              <GlassSurface
                width={"90%"}
                className="fixed z-50 flex items-center justify-between w-[90%] px-2 py-2 border-b h-fit border-b-background-700"
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
                        <Button>Sign Up</Button>
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
            )}
          </header>
          {mounted && (
            <Particles
              key={resolvedTheme}
              particleColors={
                resolvedTheme == "light" ? ["#000000"] : ["#ffffff"]
              }
              particleCount={200}
              particleSpread={10}
              speed={0.1}
              particleBaseSize={200}
              moveParticlesOnHover
              alphaParticles={false}
              disableRotation={false}
              pixelRatio={1}
              className={
                resolvedTheme == "light" ? "fadeBottom" : "fadeBottomDark"
              }
            />
          )}
          <div className="absolute top-0 z-30 flex flex-col items-center justify-center w-full h-full mb-20 pointer-events-none">
            {mounted && (
              <GlassSurface width={"50%"} height={"50%"}>
                <div className="flex flex-col justify-center gap-2 p-20">
                  <div className="flex items-center gap-4">
                    <Image
                      src={"/chip-in-logo.png"}
                      width={150}
                      height={150}
                      alt="Chip In logo"
                    />
                    <SplitText
                      text="ChipIn"
                      className={clsx(
                        "font-bold text-center text-black text-8xl dark:text-white",
                      )}
                      delay={50}
                      duration={1.25}
                      ease="power3.out"
                      splitType="chars"
                      from={{ opacity: 0, y: 40 }}
                      to={{ opacity: 1, y: 0 }}
                      threshold={0.1}
                      rootMargin="-100px"
                      textAlign="center"
                    />
                  </div>

                  <h1 className="px-4 text-4xl font-bold">
                    Gambling without the risk.
                  </h1>

                  <h2 className="px-4 text-2xl font-bold">
                    Play casino games with virtual chips and real odds.
                  </h2>

                  <ClerkLoading>
                    <div className="flex items-center justify-start w-full gap-2 px-4 mt-2">
                      Loading...
                    </div>
                  </ClerkLoading>
                  <SignedIn>
                    <div
                      className="flex items-center justify-start w-full px-4 mt-2 pointer-events-auto"
                      onClick={() => router.push("/dashboard")}
                    >
                      <Button size={"lg"}>Start playing!</Button>
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <div className="flex items-center justify-start w-full gap-2 px-4 mt-2 pointer-events-auto">
                      <SignUpButton mode="redirect">
                        <Button size={"lg"}>Sign up!</Button>
                      </SignUpButton>
                      <SignInButton mode="redirect">
                        <Button variant={"outline"} size={"lg"}>
                          Sign in!
                        </Button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                </div>
              </GlassSurface>
            )}

            <div className="absolute bottom-10">
              <ScrollDown />
            </div>
            <Card className="absolute z-30 p-2 px-4 pointer-events-auto bottom-4 right-4">
              <span>
                <Link className="underline" href={"https://internetbowser.com"}>
                  InternetBowser
                </Link>
                , 2026
              </span>
            </Card>
          </div>
        </div>
        <div className="flex items-center justify-center w-full h-screen! overflow-hidden bg-zinc-100 dark:bg-zinc-900 relative">
          <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-1/2 h-full p-2 text-left">
            <div className="flex flex-col gap-4">
              <h1 className="z-10 text-4xl font-bold leading-tight">
                Play fair.
                <br />
                Win instantly.
              </h1>
              <p className="max-w-md text-lg text-muted-foreground">
                Fast, provably fair games that you can enjoy for free.
              </p>
              <SignedOut>
                <SignUpButton>
                  <Button>Get started now</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button onClick={() => router.push("/dashboard")}>
                  Start playing
                </Button>
              </SignedIn>
              <ClerkLoading>
                <Button disabled>Loading user...</Button>
              </ClerkLoading>
            </div>
          </div>
          <div className="absolute top-0 right-0 flex items-start w-1/2 h-full">
            <div className="relative w-full h-3/4">
              {mounted && (
                <CardSwap
                  cardDistance={60}
                  verticalDistance={70}
                  delay={5000}
                  pauseOnHover={false}
                >
                  <CardSwapCard>
                    <div className="flex flex-col object-cover w-full h-full overflow-hidden border border-foreground bg-background rounded-xl">
                      <h3 className="w-full p-4 text-2xl font-bold text-center shrink ">
                        Coinflip
                      </h3>
                      <hr className="border border-foreground" />
                      <div className="flex-1 object-cover w-full max-h-full overflow-hidden grow">
                        <img
                          alt="Coinflip image"
                          className="w-full h-full"
                          src={
                            resolvedTheme == "light"
                              ? "/promos/coinflip-promo-light.png"
                              : "/promos/coinflip-promo-dark.png"
                          }
                        />
                      </div>
                    </div>
                  </CardSwapCard>
                  <CardSwapCard>
                    <div className="flex flex-col object-cover w-full h-full overflow-hidden border border-foreground bg-background rounded-xl">
                      <h3 className="w-full p-4 text-2xl font-bold text-center shrink ">
                        Blackjack
                      </h3>
                      <hr className="border border-foreground" />
                      <div className="flex-1 object-cover w-full max-h-full overflow-hidden grow">
                        <img
                          alt="Blackjack image"
                          className="w-full h-full"
                          src={
                            resolvedTheme == "light"
                              ? "/promos/blackjack-promo-light.png"
                              : "/promos/blackjack-promo-dark.png"
                          }
                        />
                      </div>
                    </div>
                  </CardSwapCard>
                  <CardSwapCard>
                    <div className="flex flex-col object-cover w-full h-full overflow-hidden border border-foreground bg-background rounded-xl">
                      <h3 className="w-full p-4 text-2xl font-bold text-center shrink ">
                        Mines
                      </h3>
                      <hr className="border border-foreground" />
                      <div className="flex-1 object-cover w-full max-h-full overflow-hidden grow">
                        <img
                          alt="Mines image"
                          className="w-full h-full"
                          src={
                            resolvedTheme == "light"
                              ? "/promos/mines-promo-light.png"
                              : "/promos/mines-promo-dark.png"
                          }
                        />
                      </div>
                    </div>
                  </CardSwapCard>
                </CardSwap>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
