import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Every page must be server-rendered per-request (not prerendered as static
// HTML at build time), so process.env.API_URL below reflects the runtime
// container's value, not whatever was set during `pnpm build`.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CommitLens - Understand Code Changes Instantly",
  description:
    "AI-powered code change explanations for GitHub commits. Understand why code changed, not just what changed.",
  generator: "v0.app",
  icons: {
    icon: "/rect87.png",
    shortcut: "/rect87.png",
    apple: "/rect87.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="runtime-env"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.__ENV__=${JSON.stringify({
              API_URL: process.env.API_URL || "http://localhost:8000/v1",
            }).replace(/</g, "\\u003c")};`,
          }}
        />
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="2329264b-249a-4970-9c66-bc679cbea5d8" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
