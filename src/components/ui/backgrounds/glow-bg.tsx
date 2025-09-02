"use client";

import Image from "next/image";
import { Parallax } from "react-scroll-parallax";

export default function GlowBg() {
  return (
    <>
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
        <Parallax speed={-60}>
          <Image
            src="/green-blur.png"
            width={700}
            height={600}
            alt="Glow background"
            className="mr-200 mb-100"
          />
        </Parallax>
      </div>
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
        <Parallax speed={-30}>
          <Image
            src="/green-blur.png"
            width={700}
            height={600}
            alt="Glow background"
            className="ml-200 mb-55"
          />
        </Parallax>
      </div>
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
        <Parallax speed={-10}>
          <Image
            src="/green-blur.png"
            width={700}
            height={600}
            alt="Glow background"
            className="mr-90 mt-75"
          />
        </Parallax>
      </div>
    </>
  );
}
