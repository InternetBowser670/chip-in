"use client";

import { useState } from "react";
import Card from "../global/card";
import Link from "next/link";
import clsx from "clsx";

export default function OpenAdminDash({ small }: { small?: true }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  async function checkAdmin() {
    const res = await fetch("/api/check-admin", {
      method: "GET",
    });
    const data = await res.json();
    setIsAdmin(await data.isAdmin);
  }

  checkAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <Link href={"/dashboard/admin"} className="mb-6">
      <Card chin color="red" className="w-full">
        <h1
          className={clsx(
            "text-red-400 text-center",
            small
              ? "flex justify-center items-center shrink w-16 max-h-3 text-sm"
              : "text-3xl"
          )}
        >
          {small ? "Admin" : "Open Admin Dashboard"}
        </h1>
        <div className="flex justify-center"></div>
      </Card>
    </Link>
  );
}
