import { Geist, Geist_Mono, Lato, Roboto_Mono, Inter } from "next/font/google";

// I have a few fonts here, though I'll most likely stick with Lato

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const lato = Lato({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lato",
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"]
});

export const openSans = Inter();