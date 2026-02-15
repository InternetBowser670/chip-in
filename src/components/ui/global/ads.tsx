"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

type Props = {
  className?: string;
};

export function BannerAd({ className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).atOptions = {
      key: "4bc736e0d24ef16362375cb1886e45f8",
      format: "iframe",
      height: 250,
      width: 300,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/4bc736e0d24ef16362375cb1886e45f8/invoke.js";
    script.async = true;

    containerRef.current?.appendChild(script);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      containerRef.current?.replaceChildren();
      initialized.current = false;
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}

export function NativeBannerAd({ className }: Props) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://pl28698903.effectivegatecpm.com/faea847c47ef9e830735a750d376884a/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div
      id="container-faea847c47ef9e830735a750d376884a"
      className={className}
    />
  );
}

export function Popunder() {
  return (
    <Script
      id="effectivegate-popunder"
      src="https://pl28717193.effectivegatecpm.com/6b/a3/83/6ba3835d9e6cd0e9ae9f612febd8a2e0.js"
      strategy="afterInteractive"
    />
  );
}

export function SocialBar() {
  return (
    <Script
      src="https://presidepickles.com/a9/0b/88/a90b88a7741ed885556d70e5f4b92b34.js"
      strategy="afterInteractive"
    />
  );
}
