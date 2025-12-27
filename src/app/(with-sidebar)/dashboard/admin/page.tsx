"use client";

import { useState } from "react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  async function checkAdmin() {
    const res = await fetch("/api/check-admin", {
      method: "GET",
    });
    const data = await res.json();
    setIsAdmin(await data.isAdmin);
  }

  checkAdmin();

  if (isAdmin == null) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-5xl">Validating access...</h1>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-5xl">Sorry, you&apos;re not an admin.</h1>
          <h1 className="mt-4 text-3xl">
            You are not able to access this page.
          </h1>
        </div>
      </>
    );
  }

  return (
    <div className="h-full p-4">
      <h1 className="mb-2 text-5xl font-bold">Admin Options:</h1>
    </div>
  );
}
