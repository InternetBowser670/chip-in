import type { Metadata } from "next";
import "./globals.css";
import { lato } from "../lib/fonts";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Chip In",
  description: "Gambilng without the risk",
  icons: {
    icon: "/chip-in-logo.png",
    shortcut: '/chip-in-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${lato.className} antialiased p-0 text-text-50!`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
