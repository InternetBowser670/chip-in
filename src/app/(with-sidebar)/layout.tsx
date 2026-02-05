import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default async function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>
        <div className="flex h-screen! w-screen overflow-hidden">
          <Sidebar />
          <div className="h-full rounded-2xl overflow-y-auto w-[calc(100%-12.5rem)]">
            {children}
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex h-screen!">
          <div className="w-50 h-full! bg-card border-r border-r-foreground/30">
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
              <div className="flex flex-col items-center gap-2 mb-4">
                <SignInButton />
                <SignUpButton>
                  <Button>Sign Up</Button>
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
