"use client";

import Link from "next/link";
import { Button } from "../button";
import { useAdminStatus } from "@/lib/hooks/useAdminStatus";

export default function OpenAdminDash({ small }: { small?: true }) {
  const isAdmin = useAdminStatus();

  if (!isAdmin) {
    return null;
  }

  return (
    <Link href={"/dashboard/admin"} className="mb-6">
      <Button variant="destructive" className="w-full">
        {small ? "Admin" : "Open Admin Dashboard"}
      </Button>
    </Link>
  );
}
