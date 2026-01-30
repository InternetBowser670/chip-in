import type { Metadata } from "next";
import "./globals.css";
import { openSans } from "../lib/fonts";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import TimezoneSetter from "@/components/ui/timezone-setter";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "ChipIn",
  description: "Gambling without the risk",
  icons: {
    icon: "/chip-in-logo.png",
    shortcut: "/chip-in-logo.png",
  },
  openGraph: {
    title: "Chip In",
    description: "Gambling without the risk",
    images: [
      {
        url: "https://chip-in.internetbowser.com/chip-in-logo.png",
        width: 400,
        height: 400,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
      }}
    >
      <html
        suppressHydrationWarning
        className="h-screen! w-screen! subpixel-antialiased"
        lang="en"
      >
        <head>
          {/* Google Analytics */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-3GKZ3LXBM9"
          />
          <Script id="google-analytics-datalayer" strategy="afterInteractive">
            {/* this just makes sure that Next doesn't check the code (trust me, it works) */}
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3GKZ3LXBM9');
          `}
          </Script>
        </head>
        <body
          className={`${openSans.className} antialiased! h-full! w-full min-h-screen! p-0 text-text-50! bg-background-900!`}
        >
          <ThemeProvider>
            <Providers>
              <TimezoneSetter />
              {children}
            </Providers>
          </ThemeProvider>
        </body>
      </html>
      <Analytics />
    </ClerkProvider>
  );
}
