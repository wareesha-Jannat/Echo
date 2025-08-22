import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeWrapper } from "./ThemeWrapper";
import ReactQueryProvider from "./ReactQueryProvider";

import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s  |  Echo",
    default: "Echo",
  },
  icons: {
 icon : '/favicon.png'
  },
  description: "The social media app for powernerds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          <ThemeWrapper>
            {children}
            <Toaster />
          </ThemeWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
