"use client";

import { useLiveUsers } from "@/components/providers";

export default function GlobalUserCount() {
  const { global } = useLiveUsers();

  return (
    <span className="flex items-center gap-2">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
        <span className="relative inline-flex size-2 rounded-full bg-sky-500"></span>
      </span>
      Users online: {global}
    </span>
  );
}
