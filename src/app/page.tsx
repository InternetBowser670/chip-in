import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div className="w-full h-screen bg-background-900">
        <header className="w-full h-[50px] flex items-center bg-background-800 px-2 justify-between py-2 fixed border-b border-b-background-700">
          <div className="flex items-center gap-2">
            <Image
              src={"/chip-in-logo.png"}
              width={30}
              height={30}
              alt="Chip In logo"
            />{" "}
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
        <div className="flex flex-col items-center justify-center w-full h-full">
          <h1 className="mb-2 text-3xl font-bold">ChipIn</h1>
          <h1 className="text-2xl font-bold">Gambing without the risk</h1>
        </div>
      </div>
      <div className="flex items-center justify-center w-full h-screen bg-background-800">
        <h1 className="text-3xl font-bold">Coming soon!</h1>
      </div>
    </main>
  );
}
