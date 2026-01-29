"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../button";

export default function OpenAdminDash({ small }: { small?: true }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    async function checkAdmin() {
      const res = await fetch("/api/check-admin", {
        method: "GET",
      });
      const data = await res.json();
      setIsAdmin(await data.isAdmin);
    }

    checkAdmin();
  }, []);

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
