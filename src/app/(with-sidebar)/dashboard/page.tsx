"use client";

import { useRouter } from "next/navigation";
import Card from "@/components/ui/global/card";
import { GiCardJackSpades, GiCoinflip } from "react-icons/gi";
import OpenAdminDash from "@/components/ui/admin/open-admin-dash";

export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <div className="w-full p-2 pl-4 bg-gray-700">
          <h2 className="pb-2 text-3xl font-bold">Games:</h2>
          <div className="flex gap-2">
            <Card
              chin
              color="red"
              className="mr-2 cursor-pointer w-fit"
              onClick={() => router.push("/play/coinflip")}
            >
              <h1 className="mb-2 text-3xl text-red-400">Coinflip</h1>
              <div className="flex justify-center">
                <GiCoinflip size="70" className="text-red-400" />
              </div>
            </Card>
            <Card
              chin
              color="orange"
              className="mr-2 cursor-pointer w-fit grayscale"
              onClick={() => router.push("/play/blackjack")}
            >
              <h1 className="mb-2 text-3xl text-orange-400">Blackjack</h1>
              <div className="flex justify-center">
                <GiCardJackSpades size="70" className="text-orange-400" />
              </div>
            </Card>
            <Card
              chin
              color="blue"
              className="flex items-center justify-center mx-2 w-fit"
            >
              <h1 className="mb-2 text-3xl text-blue-400">More coming soon!</h1>
            </Card>
          </div>
        </div>
        <div className="flex justify-center p-2 mt-4 ">
          <OpenAdminDash />
        </div>
      </div>
    </>
  );
}
