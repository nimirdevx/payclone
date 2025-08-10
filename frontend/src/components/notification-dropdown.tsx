"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils"; // Ensure cn utility is imported

interface Notification {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: number) => void; // New prop for individual notification
}

export function NotificationsDropdown({
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
}: NotificationsDropdownProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-auto p-0 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[200px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start space-y-1 py-2 cursor-pointer",
                  !notification.read && "bg-accent/50" // Highlight unread
                )}
                onClick={() => onMarkAsRead(notification.id)} // Mark as read on click
              >
                <div className="flex items-center gap-2 w-full">
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-paypal-accent" /> // Unread indicator
                  )}
                  <p className="text-sm font-medium leading-none flex-1">
                    {notification.message}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground ml-4">
                  {formatDistanceToNowStrict(new Date(notification.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="text-muted-foreground text-center py-4">
              No new notifications.
            </DropdownMenuItem>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
