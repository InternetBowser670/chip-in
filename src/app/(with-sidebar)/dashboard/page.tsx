"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/global/card";
import { GiCoinflip } from "react-icons/gi";

export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-full bg-gray-700 p-2">
          <h2 className="font-bold pb-2 text-xl">Games:</h2>
          <div className="flex gap-2">
            <Card
              chin
              color="red"
              className="mx-2 w-fit cursor-pointer"
              onClick={() => router.push("/play/coinflip")}
            >
              <h1 className="mb-2 text-3xl text-red-400">Coinflip</h1>
              <div className="flex justify-center">
                <GiCoinflip size="70" className="text-red-400" />
              </div>
            </Card>
            <Card
              chin
              color="blue"
              className="mx-2 w-fit flex items-center justify-center"
            >
              <h1 className="mb-2 text-3xl text-blue-400">More coming soon!</h1>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
