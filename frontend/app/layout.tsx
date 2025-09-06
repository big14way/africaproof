import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import Provider from "@/components/Provider";

export const metadata: Metadata = {
  title: "AfricanProof - Web3 Identity for Africa",
  description: "Complete Web3 identity and financial inclusion platform for Africa with ENS integration",
  generator: "AfricanProof",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased dark`}
    >
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Provider>
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </Provider>
      </body>
    </html>
  );
}
