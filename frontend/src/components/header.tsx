"use client"

import type * as React from "react"
import { User2 } from "lucide-react"
import { MobileSidebarToggle } from "@/components/mobile-sidebar-toggle"
import { NotificationsDropdown } from "@/components/notification-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { Notification } from "@/types" // Import from your types file

interface HeaderProps {
  userName?: string
  showMobileSidebarToggle?: boolean
  notifications?: Notification[]
  onMarkAllNotificationsAsRead?: () => void
  onMarkAsRead?: (id: number) => void
  onDeleteNotification?: (id: number) => void // Optional delete functionality
  className?: string
  fixed?: boolean
  unreadCount: number;
}

export function Header({
  userName,
  showMobileSidebarToggle = false,
  notifications = [],
  onMarkAllNotificationsAsRead,
  onMarkAsRead,
  onDeleteNotification,
  className = "",
  fixed = true,
  unreadCount,
}: HeaderProps) {
  const baseClasses = "flex h-16 items-center gap-4 border-b bg-card px-6 lg:h-[72px] shadow-sm z-50"
  // For dashboard pages with sidebar, header should start after sidebar (250px width)
  // For landing page, header should span full width
  const fixedClasses = fixed 
    ? showMobileSidebarToggle 
      ? "fixed top-0 left-0 right-0 md:left-[250px]" // Dashboard: full width on mobile, starts after sidebar on desktop
      : "fixed top-0 left-0 right-0" // Landing page: full width
    : ""
  const headerClasses = `${baseClasses} ${fixedClasses} ${className}`.trim()

  return (
    <header className={headerClasses}>
      {showMobileSidebarToggle && <MobileSidebarToggle />}
      
      <div className="flex-1 flex items-center justify-end gap-4">
        {/* User Name and Avatar */}
        {userName && (
          <div className="hidden md:flex items-center gap-2">
            <User2 className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">{userName}</span>
          </div>
        )}
        
        {/* Notifications Dropdown */}
        {onMarkAllNotificationsAsRead && onMarkAsRead && (
          <NotificationsDropdown
            notifications={notifications}
            unreadCount={unreadCount} // Pass down the prop
            onMarkAllAsRead={onMarkAllNotificationsAsRead}
            onMarkAsRead={onMarkAsRead}
            onDeleteNotification={onDeleteNotification}
          />
        )}
  
        
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}