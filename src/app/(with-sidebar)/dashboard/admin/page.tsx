"use client";

import Card from "@/components/ui/global/card";
import { useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any[]>([]);

  async function checkAdmin() {
    const res = await fetch("/api/check-admin", {
      method: "GET",
    });
    const data = await res.json();
    setIsAdmin(await data.isAdmin);
  }

  async function fetchUserData() {
    const res = await fetch("/api/get-users", {
      method: "POST",
    });
    const data = await res.json();
    setUserData(data.users);
  }

  useEffect(() => {
    checkAdmin();
    fetchUserData();
  }, []);

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
    <div className="max-h-full p-4 overflow-y-auto">
      <h1 className="mb-2 text-5xl font-bold">Admin Options:</h1>
      <Card noHover>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>

          {userData.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </table>
      </Card>
    </div>
  );
}
