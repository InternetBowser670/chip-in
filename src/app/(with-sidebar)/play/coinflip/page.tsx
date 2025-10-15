"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function Page() {
  return (
    <>
      <div className="flex justify-center items-center w-full h-full">
        <div className="flex-col items-center p-2 bg-gray-700 rounded-2xl text-center">
          <h1 className="text-3xl font-bold">Coming soon!</h1>
          <DotLottieReact
            segment={[0, 44]}
            src="https://lottie.host/097a8e78-8f21-46ab-8342-52feeab0a830/QVF4Cv44bH.lottie"
            loop
            autoplay
          />
          <p>Enjoy my coinflip animation for now</p>
        </div>
      </div>
    </>
  );
}
