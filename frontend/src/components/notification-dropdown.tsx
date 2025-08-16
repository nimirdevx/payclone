"use client";

import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";
import { Notification } from '@/types';

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: number) => void;
  onDeleteNotification?: (id: number) => void;
}

export function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onMarkAsRead,
  onDeleteNotification,
}: NotificationsDropdownProps) {

  const getNotificationIcon = (type: string | null | undefined) => {
    switch (type) {
      case "transaction":
        return "💰";
      case "request":
        return "🤝";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  const getNotificationTypeLabel = (type: string | null | undefined) => {
    switch (type) {
      case "transaction":
        return "Transaction";
      case "request":
        return "Request";
      case "system":
        return "System";
      default:
        return "Notification";
    }
  };

  const handleMarkAsRead = (notificationId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onMarkAsRead(notificationId);
  };

  const handleDelete = (notificationId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onDeleteNotification) {
      onDeleteNotification(notificationId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-8 px-2 text-xs flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative rounded-lg p-3 mb-2 border transition-all hover:shadow-sm cursor-pointer",
                    !notification.read 
                      ? "bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-l-blue-500" 
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-relaxed", !notification.read ? "font-medium" : "font-normal")}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", !notification.read && "opacity-100")}>
                      {!notification.read && (
                        <Button size="sm" variant="ghost" onClick={(e) => handleMarkAsRead(notification.id, e)} className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100" title="Mark as read">
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      {onDeleteNotification && (
                        <Button size="sm" variant="ghost" onClick={(e) => handleDelete(notification.id, e)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-100" title="Delete notification">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium text-sm mb-1">No notifications</h3>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}