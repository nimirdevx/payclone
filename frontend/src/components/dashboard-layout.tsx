"use client"

import type * as React from "react"
import { User2, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MobileSidebarToggle } from "@/components/mobile-sidebar-toggle"
import { useTheme } from "next-themes"
import { NotificationsDropdown } from "@/components/notification-dropdown"
import { AppSidebar } from "@/components/app-sidebar" // Import the new AppSidebar

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
  onLogout: () => void
  notifications: {
    id: number
    userId: number
    message: string
    timestamp: string
    read: boolean
  }[]
  onMarkAllNotificationsAsRead: () => void
  onMarkAsRead: (id: number) => void // Add this line
}

export function DashboardLayout({
  children,
  userName,
  onLogout,
  notifications,
  onMarkAllNotificationsAsRead,
  onMarkAsRead, // Add this line
}: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <AppSidebar userName={userName} onLogout={onLogout} />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 md:ml-[250px] transition-none">
          {" "}
          {/* Fixed margin-left */}
          <header className="flex h-16 items-center gap-4 border-b bg-card px-6 lg:h-[72px] shadow-sm">
            <MobileSidebarToggle />
            <div className="flex-1 flex items-center justify-end gap-4">
              {/* User Name and Avatar in Header */}
              <div className="hidden md:flex items-center gap-2">
                <User2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{userName}</span>
              </div>
              {/* Notifications Dropdown */}
              <NotificationsDropdown
                notifications={notifications}
                onMarkAllAsRead={onMarkAllNotificationsAsRead}
                onMarkAsRead={onMarkAsRead} // Add this line
              />
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full text-foreground hover:bg-muted"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-6 p-6 lg:p-8 bg-muted/20">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
