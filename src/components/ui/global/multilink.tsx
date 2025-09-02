// from pzn - may not use

"use client";

import { useState } from "react";
import Link from "next/link";
import React from "react";
import Card from "./card";

interface MultiLinkProps {
  label: string;
  subLinks?: { label: string; href: string }[];
}

export default function MultiLink({ label, subLinks }: MultiLinkProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative inline-flex" onClick={() => setHovered(!hovered)}>
      <p className="px-2 py-1 hover:underline">{label}</p>

      {hovered && subLinks && subLinks.length > 0 && (
        <div
          className="fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-black/50 z-60"
          onClick={() => setHovered(false)}
        >
          <Card className="p-4! flex flex-col gap-2 max-w-[90vw] items-center">
            <p className="mb-2! text-xl">{label + " Links:"}</p>
            <div className="flex gap-2">
              {subLinks.map((subLink) => (
                <>
                  <Link
                    key={subLink.href}
                    href={subLink.href}
                    className="px-3 py-1 text-gray-200 hover:underline"
                  >
                    {subLink.label}
                  </Link>
                  {subLink !== subLinks[subLinks.length - 1] && <span>|</span>}
                </>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
