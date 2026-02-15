"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAdminStatus } from "@/lib/hooks/useAdminStatus";

type Props = {
  className?: string;
};

export function BannerAd({ className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isAdmin = useAdminStatus();

  useEffect(() => {
    if (!containerRef.current) return;

    // Always clear previous content
    containerRef.current.replaceChildren();

    if (isAdmin) return;

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

    containerRef.current.appendChild(script);
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  return <div ref={containerRef} className={className} />;
}

export function NativeBannerAd({ className }: Props) {
  const pathname = usePathname();
  const isAdmin = useAdminStatus();

  useEffect(() => {
    const existing = document.querySelector(
      'script[src*="effectivegatecpm.com/faea847c47ef9e830735a750d376884a"]',
    );
    existing?.remove();

    if (isAdmin) return;

    const script = document.createElement("script");
    script.src =
      "https://pl28698903.effectivegatecpm.com/faea847c47ef9e830735a750d376884a/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  return (
    <div
      id="container-faea847c47ef9e830735a750d376884a"
      className={className}
    />
  );
}

export function SocialBar() {
  const pathname = usePathname();
  const isAdmin = useAdminStatus();
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    if (isAdmin) return;

    const script = document.createElement("script");
    script.src =
      "https://pl28717193.effectivegatecpm.com/6b/a3/83/6ba3835d9e6cd0e9ae9f612febd8a2e0.js";
    script.async = true;

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      script.remove();
      scriptRef.current = null;
    };
  }, [pathname, isAdmin]);

  return null;
}

export function Popunder() {
  const pathname = usePathname();
  const isAdmin = useAdminStatus();
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    if (isAdmin) return;

    const script = document.createElement("script");
    script.src =
      "https://presidepickles.com/a9/0b/88/a90b88a7741ed885556d70e5f4b92b34.js";
    script.async = true;

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      script.remove();
      scriptRef.current = null;
    };
  }, [pathname, isAdmin]);

  return null;
}
