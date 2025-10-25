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
import { currentUser } from "@clerk/nextjs/server";

export default async function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  return (
    <>
      <SignedIn>
        <div className="flex h-screen!">
          <div className="w-50 h-full! bg-background-700">
            <div className="flex flex-col items-center justify-between h-full">
              <div className="flex flex-col items-center mx-2 mt-2">
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
              </div>
              <div className="flex flex-col items-center mb-4 overflow-x-hidden">
                <div className="flex justify-end gap-4 overflow-hidden">
                  <UserButton />
                  <div className="overflow-hidden">
                    <p className="inline overflow-hidden">{user?.username}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-full rounded-2xl">{children}</div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex h-screen!">
          <div className="w-50 h-full! bg-background-700">
            <div className="flex flex-col items-center justify-between h-full mt-2">
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
          <div className="flex items-center justify-center w-full h-screen">
            Please sign in to access the dashboard.
          </div>
        </div>
      </SignedOut>
    </>
  );
}
