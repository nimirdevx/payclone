"use client"

import type * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { Notification } from "@/types"

interface DashboardLayoutProps {
  children: React.ReactNode
  userName: string
  onLogout: () => void
  notifications: Notification[]
  unreadCount: number
  onMarkAllNotificationsAsRead: () => void
  onMarkAsRead: (id: number) => void
  onDeleteNotification: (id: number) => void
}

export function DashboardLayout({
  children,
  userName,
  onLogout,
  notifications,
  unreadCount,
  onMarkAllNotificationsAsRead,
  onMarkAsRead,
  onDeleteNotification,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <AppSidebar userName={userName} onLogout={onLogout} />
        
        {/* Main Content Wrapper */}
        <div className="flex flex-col flex-1 w-full min-w-0 ml-0 md:ml-[var(--sidebar-width,250px)]">
          {/* Fixed Header */}
          <Header
            userName={userName}
            showMobileSidebarToggle={true}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllNotificationsAsRead={onMarkAllNotificationsAsRead}
            onMarkAsRead={onMarkAsRead}
            onDeleteNotification={onDeleteNotification}
            fixed={true}
          />
          
          {/* Main Content Area */}
          <main className="flex-1 w-full pt-16 lg:pt-[72px]">
            <div className="w-full h-full p-6 lg:p-8 bg-muted/20 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-72px)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}