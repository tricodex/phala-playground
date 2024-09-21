// src/app/layout.tsx
import NextAuthSessionProvider from '@/components/providers/session-provider';
import { TopNav } from '@/components/top-nav';
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthGate from '@/components/auth-gate';

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
  title: "Web3 Freelance Marketplace",
  description: "Connect, Create, and Verify with AI-Powered Trust",
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
          <TopNav />
          <AuthGate>
            <main className="container mx-auto p-4">
              {children}
            </main>
          </AuthGate>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}