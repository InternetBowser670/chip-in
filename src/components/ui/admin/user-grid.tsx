import { Badge } from "@/lib/types";
import { AgGridReact } from "ag-grid-react";
import { v4 } from "uuid";
import Card from "../global/card";
import { gridDarkTheme } from "@/components/grid";

const defaultColDef = { filter: true };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UserGrid({ userData }: { userData: any[] }) {
  function userLogoIconRenderer({ value }: { value: string }) {
    return (
      <div className="flex items-center justify-center h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="User Logo" className="w-8 h-8 rounded-full" />
      </div>
    );
  }

  function badgeGridRenderer({ value }: { value: Badge[] }) {
    if (!value || value.length === 0) {
      return <div className="mx-[15px] h-full">None</div>;
    }

    return (
      <div className="px-[15px] h-full">
        {value.map((badge, index) => (
          <p
            key={badge.name + v4()}
            className="w-8 h-8 text-center rounded-full"
          >
            {badge.name.split("")[0].toUpperCase() +
              badge.name.split(" ")[0].slice(1)}{" "}
            {index < value.length - 1 ? "," : ""}
          </p>
        ))}
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
    { field: "id", headerName: "User ID" },
    { field: "username" },
    {
      field: "totalChips",
      editable: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueFormatter: (params: any) => {
        return (params.value ?? 0).toLocaleString();
      },
    },
    {
      field: "created_at",
      headerName: "Account Created At",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueFormatter: (params: any) => {
        return new Date(params.value).toLocaleString();
      },
    },
    {
      field: "badges",
      headerName: "Badges",
      cellRenderer: badgeGridRenderer,
    },
    {
      field: "last_active_at",
      headerName: "Last Active At",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      valueFormatter: (params: any) => {
        return new Date(params.value).toLocaleString();
      },
    },
  ];

  return (
    <>
      <Card noHover className="mx-20 mt-8">
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
