"use client";

import { useLiveUsers } from "@/components/providers";

export default function GlobalUserCount() {
  const { global } = useLiveUsers();

  return (
    <span className="flex items-center gap-2">
      <span className="relative flex size-2">
        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-400"></span>
        <span className="relative inline-flex rounded-full size-2 bg-sky-500"></span>
      </span>
      Users online: {global}
    </span>
  );
}
