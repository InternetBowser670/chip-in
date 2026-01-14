"use client";

import { useRouter } from "next/navigation";

export default function OpenProfile() {

  const router = useRouter();
  
  return (
    <button
      onClick={() => router.push("/profile")}
      type="button"
      className="inline overflow-hidden hover:underline"
    >
      Your Profile
    </button>
  );
}
