"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCheck, Filter, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNowStrict } from "date-fns";
import api from "@/lib/api";

interface Notification {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
  read: boolean;
  type?: "transaction" | "request" | "system";
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filter]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (err: any) {
      setUser({ id: 1, name: "John Doe", email: "john.doe@example.com" });
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Mock data for development
      const mockNotifications = [
        {
          id: 1,
          userId: 1,
          message: "You received $50.00 from John Doe",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          type: "transaction" as const,
        },
        {
          id: 2,
          userId: 1,
          message: "Your payment of $25.00 to Jane Smith was successful",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: true,
          type: "transaction" as const,
        },
        {
          id: 3,
          userId: 1,
          message: "Money request from Alice Johnson for $100.00",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          type: "request" as const,
        },
        {
          id: 4,
          userId: 1,
          message: "Your account security settings have been updated",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          type: "system" as const,
        },
        {
          id: 5,
          userId: 1,
          message: "Failed transaction attempt for $200.00",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          type: "transaction" as const,
        },
      ];
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    if (filter === "unread") {
      filtered = filtered.filter((notification) => !notification.read);
    } else if (filter === "read") {
      filtered = filtered.filter((notification) => notification.read);
    } else if (filter !== "all") {
      filtered = filtered.filter((notification) => notification.type === filter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      // Mock functionality
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.patch("/notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      // Mock functionality
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      // Mock functionality
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "transaction":
        return "💰";
      case "request":
        return "🤝";
      case "system":
        return "⚙️";
      default:
        return "📢";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <DashboardLayout
        userName="Loading..."
        onLogout={handleLogout}
        notifications={[]}
        onMarkAllNotificationsAsRead={() => {}}
        onMarkAsRead={() => {}}
      >
        <div className="-m-6 lg:-m-8">
          <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={user.name}
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAllNotificationsAsRead={markAllAsRead}
      onMarkAsRead={markAsRead}
    >
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your account activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="transaction">Transaction Related</SelectItem>
                  <SelectItem value="request">Request Related</SelectItem>
                  <SelectItem value="system">System Notifications</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {filter === "all" ? "You're all caught up!" : "No notifications match your current filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{getNotificationIcon(notification.type || "system")}</div>
                      <div className="flex-1">
                        <p className={`${!notification.read ? "font-semibold" : ""}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type || "system"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNowStrict(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
