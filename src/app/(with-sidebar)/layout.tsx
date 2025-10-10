import Image from "next/image";
import Link from "next/link";
import ClaimChips from "@/components/ui/global/claim-chips";
import ChipCount from "@/components/ui/global/chip-count";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>
        <div className="flex h-screen!">
          <div className="w-50 h-full! bg-background-700">
            <div className="flex flex-col items-center mt-2">
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
          </div>
          <div className="w-full h-full rounded-2xl">{children}</div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center w-full h-screen">
          Please sign in to access the dashboard.
        </div>
      </SignedOut>
    </>
  );
}
