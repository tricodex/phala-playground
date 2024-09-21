// src/app/layout.tsx
import NextAuthSessionProvider from '@/components/providers/session-provider';
import { TopNav } from '@/components/top-nav';
import type { Metadata } from "next";
import localFont from "next/font/local";
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';  // Import DynamicContextProvider
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";      // Import Ethereum connectors
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Web3 Fiverr",
  description: "Decentralized service marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <DynamicContextProvider
            settings={{
              environmentId: '2d8eb22d-e50d-4a05-98f0-560f2baecbf4',  // Your Dynamic environment ID
              walletConnectors: [EthereumWalletConnectors],          // Connectors (MetaMask, etc.)
            }}
          >
            <TopNav />
            <main className="container mx-auto p-4">
              {children}
            </main>
          </DynamicContextProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
