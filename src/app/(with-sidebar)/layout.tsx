import Image from "next/image";
import Link from "next/link";
import ClaimChips from "@/components/ui/global/claim-chips";
import ChipCount from "@/components/ui/global/chip-count";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { SecondaryButton } from "@/components/ui/global/buttons";
import OpenProfile from "@/components/ui/profile/open-profile";
import OpenAdminDash from "@/components/ui/admin/open-admin-dash";
import { GiCardJackSpades, GiCoinflip, GiUnlitBomb } from "react-icons/gi";

export default async function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>
        <div className="flex h-screen! w-full">
          <div className="w-50 h-full! bg-background-700">
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
                  <Link href="/dashboard" className="my-2">
                    <SecondaryButton text="Dashboard" />
                  </Link>
                </div>
                <hr className="w-full border" />
                <div className="flex flex-col w-full mx-2 mt-2 text-xl text-left">
                  <Link
                    href="/play/coinflip"
                    className="flex items-center gap-2"
                  >
                    <GiCoinflip size="25" />
                    <p className="hover:underline">Coinflip</p>
                  </Link>
                  <Link
                    href="/play/blackjack"
                    className="flex items-center gap-2"
                  >
                    <GiCardJackSpades size="25" />
                    <p className="hover:underline">Blackjack</p>
                  </Link>
                  <Link href="/play/mines" className="flex items-center gap-2">
                    <GiUnlitBomb size="25" />
                    <p className="hover:underline">Mines</p>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col items-center mb-4 overflow-x-hidden">
                <OpenAdminDash small />
                <div className="flex justify-end gap-4 overflow-hidden">
                  <UserButton />
                  <div className="overflow-hidden">
                    <OpenProfile />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-full rounded-2xl w-[calc(100%-12.5rem)]">
            {children}
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex h-screen!">
          <div className="w-50 h-full! bg-background-700">
            <div className="flex flex-col items-center justify-between h-full pt-2">
              <Link href={"/"} className="flex justify-center">
                <Image
                  src={"/chip-in-logo.png"}
                  width={50}
                  height={50}
                  alt="Chip In logo"
                />
                <p className="flex items-center text-lg!">ChipIn</p>
              </Link>
              <div className="flex flex-col items-center mb-4">
                <SignInButton />
                <SignUpButton>
                  <button
                    type="button"
                    className="px-2 py-1 m-2 text-sm font-medium transition-all border-2 border-b-4 cursor-pointer rounded-2xl bg-accent-900 sm:text-base sm:px-5 border-accent-400 hover:bg-accent-800"
                  >
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center w-[calc(100%-200px)] h-screen">
            Please sign in to access this page.
          </div>
        </div>
      </SignedOut>
    </>
  );
}
