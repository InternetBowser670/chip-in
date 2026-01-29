"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
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
        <h1
          className={clsx(
            "text-center",
            small
              ? "flex justify-center items-center shrink w-16 max-h-3 text-sm p-1"
              : "text-3xl",
          )}
        >
          {small ? "Admin" : "Open Admin Dashboard"}
        </h1>
        <div className="flex justify-center"></div>
      </Button>
    </Link>
  );
}
