import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers"; // Import cookies from next/headers
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PayClone - Your Money, Simplified.",
  description:
    "Send, receive, and manage your money with ease. Secure, fast, and reliable payments for everyone.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get defaultOpen state for sidebar from cookies for persistence [^4]
  const cookieStore = await cookies(); // Await cookies() to get the ReadonlyRequestCookies object
  const defaultSidebarOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
  <html lang="en" suppressHydrationWarning className="h-full w-full">
    <body className={`${inter.className} h-full w-full`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider defaultOpen={defaultSidebarOpen}>
          {children}
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </body>
  </html>
);
}
