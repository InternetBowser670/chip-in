"use client";

import { useEffect, useState } from "react";

export default function ScrollDown() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed flex justify-center left-0 z-[999] items-center content-center bottom-10 w-full transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="border-2 p-2 backdrop-filter backdrop-blur-md border-[#121212] rounded-2xl dark:border-[#ededed] animate-bounce bg-black/20">
        <div className="relative flex flex-col items-center justify-center top-1">
          <p className="mb-2">Scroll Down</p>
        </div>
      </div>
    </div>
  );
}
