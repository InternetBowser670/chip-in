import { useState } from "react";
import Card from "../global/card";
import Link from "next/link";

export default function OpenAdminDash() {
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
    <Link href={"/dashboard/admin"}>
      <Card chin color="red" className="w-full">
        <h1 className="mb-2 text-3xl text-red-400">Open Admin Dashboard</h1>
        <div className="flex justify-center"></div>
      </Card>
    </Link>
  );
}
