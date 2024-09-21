// src/app/layout.tsx
import NextAuthSessionProvider from '@/components/providers/session-provider';
import { TopNav } from '@/components/top-nav';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';  // Import DynamicContextProvider
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";      // Import Ethereum connectors

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

// Define custom EVM networks, including Chiado Testnet
const evmNetworks = [
  {
    blockExplorerUrls: ['https://blockscout.chiadochain.net'],  // Chiado block explorer
    chainId: 10200,  // Chiado Testnet chain ID
    chainName: 'Chiado Testnet',
    iconUrls: ['https://app.dynamic.xyz/assets/networks/gnosis.svg'],  // Optional, Gnosis icon URL
    name: 'Chiado',
    nativeCurrency: {
      decimals: 18,
      name: 'xDAI',
      symbol: 'xDAI',
    },
    networkId: 10200,
    rpcUrls: ['https://rpc.chiadochain.net'],  // Chiado Testnet RPC URL
    vanityName: 'Chiado',
  },
];

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
        <DynamicContextProvider
          settings={{
            environmentId: '2d8eb22d-e50d-4a05-98f0-560f2baecbf4',  // Your Dynamic environment ID
            walletConnectors: [EthereumWalletConnectors],          // Ethereum-compatible wallets (MetaMask, etc.)
            overrides: { evmNetworks },                           // Use the Chiado Testnet network
          }}
        >
          <NextAuthSessionProvider>
            <TopNav />
            <main className="container mx-auto p-4">
              {children}
            </main>
          </NextAuthSessionProvider>
        </DynamicContextProvider>
      </body>
    </html>
  );
}
