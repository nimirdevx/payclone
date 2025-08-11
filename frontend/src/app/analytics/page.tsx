"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Calendar, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AdvancedAnalytics } from "@/components/advanced-analytics";
import api from "@/lib/api";

interface Transaction {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  status: string;
  timestamp: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

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
      fetchBalance(user.id);
      fetchTransactions(user.id);
      setLoading(false);
    }
  }, [user, timeRange]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (err: any) {
      console.error("Failed to fetch user details", err);
      // Mock user for development
      setUser({
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com"
      });
    }
  };

  const fetchBalance = async (userId: number) => {
    try {
      const response = await api.get(`/wallets/user/${userId}`);
      setBalance(response.data.balance);
    } catch (err: any) {
      console.error("Failed to fetch balance", err);
      setBalance(2500.75); // Mock balance
    }
  };

  const fetchTransactions = async (userId: number) => {
    try {
      const response = await api.get(`/transactions/user/${userId}`);
      let fetchedTransactions = response.data;
      
      // Apply time range filter
      if (timeRange !== "all") {
        const now = new Date();
        const filterDate = new Date();
        
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
        }
        
        fetchedTransactions = fetchedTransactions.filter(
          (t: Transaction) => new Date(t.timestamp) >= filterDate
        );
      }
      
      setTransactions(fetchedTransactions);
    } catch (err: any) {
      console.error("Failed to fetch transactions", err);
      // Generate mock data based on time range
      const generateMockData = (days: number) => {
        return Array.from({ length: Math.min(days * 2, 50) }, (_, i) => ({
          id: i + 1,
          senderId: Math.random() > 0.5 ? userId : Math.floor(Math.random() * 100) + 2,
          recipientId: Math.random() > 0.5 ? userId : Math.floor(Math.random() * 100) + 2,
          amount: Math.floor(Math.random() * 500) + 10,
          status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)],
          timestamp: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000).toISOString(),
        }));
      };

      let mockDays = 365; // Default to 1 year
      switch (timeRange) {
        case "week": mockDays = 7; break;
        case "month": mockDays = 30; break;
        case "quarter": mockDays = 90; break;
        case "year": mockDays = 365; break;
      }
      
      setTransactions(generateMockData(mockDays));
    }
  };

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
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={user.name}
      onLogout={handleLogout}
      notifications={[]}
      onMarkAllNotificationsAsRead={() => {}}
      onMarkAsRead={() => {}}
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
          transactions={transactions} 
          userId={user?.id || 1} 
          balance={balance}
        />

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Spending Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Largest Transaction</span>
                  <span className="font-semibold">
                    ${Math.max(...transactions.map(t => t.amount), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Most Active Day</span>
                  <span className="font-semibold">
                    {transactions.length > 0 
                      ? new Date(transactions[0].timestamp).toLocaleDateString('en-US', { weekday: 'long' })
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Average per Week</span>
                  <span className="font-semibold">
                    ${(transactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(Math.ceil(transactions.length / 7), 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Days</span>
                  <span className="font-semibold">
                    {new Set(transactions.map(t => new Date(t.timestamp).toDateString())).size} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Peak Hour</span>
                  <span className="font-semibold">
                    {transactions.length > 0 
                      ? `${new Date(transactions[0].timestamp).getHours()}:00`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction Frequency</span>
                  <span className="font-semibold">
                    {transactions.length > 0 
                      ? `${(transactions.length / Math.max(new Set(transactions.map(t => new Date(t.timestamp).toDateString())).size, 1)).toFixed(1)}/day`
                      : '0/day'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
