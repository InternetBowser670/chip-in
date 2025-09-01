import type { Metadata } from "next";
import "./globals.css";
import { lato } from "../lib/fonts";

export const metadata: Metadata = {
  title: "Chip In",
  description: "Gambilng without the risk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.className} antialiased p-0`}>{children}</body>
    </html>
  );
}
