import type { Metadata } from "next";
import "./globals.css";
import { openSans } from "../lib/fonts";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Chip In",
  description: "Gambilng without the risk",
  icons: {
    icon: "/chip-in-logo.png",
    shortcut: "/chip-in-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html className="h-screen!" lang="en">
        <body className={`${openSans.className} antialiased! h-full! min-h-screen! p-0 text-text-50! bg-background-900!`}>
          <Providers>{children}</Providers>
        </body>
      </html>
      <Analytics />
    </ClerkProvider>
  );
}
