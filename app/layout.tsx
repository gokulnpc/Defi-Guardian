import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Manrope } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { DynamicProvider } from "@/components/providers/dynamic-provider";
import { WagmiProviderWrapper } from "@/components/providers/wagmi-provider";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "DeFi Guardians - Cross-Chain Insurance Platform",
  description:
    "Secure your DeFi investments with cross-chain insurance coverage, governance, and claims processing.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${manrope.variable} antialiased`}
    >
      <body className="font-sans">
        <WagmiProviderWrapper>
          <DynamicProvider>
            <Navigation />
            {children}
          </DynamicProvider>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
