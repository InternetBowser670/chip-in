import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Sidebar from "@/components/ui/sidebar";

export default async function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>
        <div className="flex h-screen! w-full">
          <Sidebar />
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
