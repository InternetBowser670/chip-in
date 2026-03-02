'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";

export default function page() {
  const router = useRouter();
  
  return(
    <>
      <div className="flex h-screen! w-screen overflow-hidden">
        <Sidebar />
        <div className="h-full rounded-2xl overflow-y-auto w-[calc(100%-12.5rem)]">
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-card p-8 rounded-lg border border-foreground/30">
              <div className="flex items-center justify-center wrap gap-4">
                <div className="text-9xl font-bold">4</div>
                  <Image src="/opengraph-image.png" alt="0" width={128} height={128}/>
                <div className="text-9xl font-bold">4</div>
              </div>
              <br></br>
              <div className="flex justify-center items-center">
                We're sorry, we cannot find the page you were looking for.
              </div>
              <div
              className="flex items-center justify-center mt-3"
              onClick={() => router.push("/dashboard")}
              >
              <Button size={"lg"}>Dashboard</Button>
              </div>
            </div>
          </div>     
        </div>
      </div>
    </>
  )
}