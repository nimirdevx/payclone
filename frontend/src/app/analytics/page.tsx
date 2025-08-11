"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Calendar, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AdvancedAnalytics } from "@/components/advanced-analytics";
import { User, Transaction, Notification } from "@/types";
import { authApi, transactionApi, walletApi, notificationApi } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";
export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        
        const userData = await authApi.getMe();
        setUser(userData);

        // Fetch all data concurrently after getting user
        const [walletData, transactionData, notificationData] = await Promise.all([
          walletApi.getUserWallet(userData.id),
          transactionApi.getUserTransactions(userData.id),
          notificationApi.getUserNotifications(userData.id)
        ]);
        
        setBalance(walletData?.balance || 0);
        setTransactions(transactionData);
        setNotifications(notificationData);

      } catch (err: any) {
        console.error("Failed to initialize dashboard", err);
        setError("Could not load your analytics data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load page data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Filter transactions based on time range
  const filteredTransactions = transactions.filter(t => {
      if (timeRange === "all") return true;
      const now = new Date();
      const txDate = new Date(t.timestamp);
      let filterDate = new Date();

      switch (timeRange) {
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return true;
      }
      return txDate >= filterDate;
  });


  if (loading) {
    return (
      <DashboardLayout
        userName="Loading..."
        onLogout={handleLogout}
        notifications={[]}
        onMarkAllNotificationsAsRead={() => {}}
        onMarkAsRead={() => {}}
      >
        {/* Skeleton UI */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardHeader><Skeleton className="h-4 w-20" /></CardHeader><CardContent><Skeleton className="h-8 w-24" /></CardContent></Card>
            ))}
          </div>
          <Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !user) {
    return (
         <div className="flex min-h-screen items-center justify-center bg-background text-destructive text-center p-4">
            <div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p>{error || "Could not load user data."}</p>
                <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
            </div>
        </div>
    )
  }

  return (
    <DashboardLayout
      userName={`${user.firstName} ${user.lastName}`}
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      onMarkAsRead={handleMarkNotificationAsRead}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Detailed insights into your financial activity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <AdvancedAnalytics 
          transactions={filteredTransactions} 
          userId={user.id} 
          balance={balance}
        />
      </div>
    </DashboardLayout>
  );
}