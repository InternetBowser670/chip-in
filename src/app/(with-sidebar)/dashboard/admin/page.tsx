/* eslint-disable @next/next/no-img-element */
"use client";

import Card from "@/components/ui/global/card";
import { useEffect, useState } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { gridDarkTheme } from "@/components/grid"
import { useUser } from "@clerk/nextjs";
import { useChips } from "@/components/providers";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any[]>([]);

  const user = useUser();

  const { setChips } = useChips();

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

  async function giveUserChips(
    userId: string,
    amt: number,
    mode: "set" | "increment",
    username: string
  ) {
    const res = await fetch("/api/admin/give-chips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, amt, mode }),
    });

    const json = await res.json();

    if (res.ok) {
      if (json.userId = user.user?.id) {
        setChips(amt);
      }
      alert(`Successfully updated chips for user "${username}"`);
    } else {
      alert(`Failed to update chips for user "${username}" with error ${res.status} ${json.message && `and message: ${json.message}`}`);
    }
  }

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

  const defaultColDef = { filter: true };

  function UserGrid() {
    function userLogoIconRenderer({ value }: { value: string }) {
      return (
        <div className="flex items-center justify-center w-full h-10">
          <img src={value} alt="User Logo" className="w-8 h-8 rounded-full" />
        </div>
      );
    }

    const colDefs = [
      {
        field: "image_url",
        filter: false,
        cellRenderer: userLogoIconRenderer,
        headerName: "Profile Picture",
      },
      { field: "id" },
      { field: "username" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { field: "totalChips", editable: true, valueFormatter: (params: any) => { return (params.value ?? 0).toLocaleString(); }
 },
    ];

    return (
      <>
        <Card noHover className="mx-20">
          <h1 className="mb-6 text-3xl">Manage Users</h1>
          <div className="h-[500px]">
            <AgGridReact
              rowData={userData}
              columnDefs={colDefs}
              theme={gridDarkTheme}
              defaultColDef={defaultColDef}
              pagination={true}
              onCellValueChanged={(event) => {
                if (event.colDef.field === "totalChips") {
                  giveUserChips(
                    event.data.id,
                    Number(event.data.totalChips),
                    "set",
                    event.data.username
                  );
                }
              }}
            />
          </div>
        </Card>
      </>
    );
  }

  return (
    <div className="max-h-full p-4 overflow-y-auto">
      <h1 className="mb-2 text-5xl font-bold">Admin Options:</h1>
      <UserGrid />
    </div>
  );
}
