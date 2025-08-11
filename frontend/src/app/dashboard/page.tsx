"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Send, Wallet, Repeat2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AddMoneyModal } from "@/components/add-money-modal";
import { SendMoneyModal } from "@/components/send-money-modal";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNowStrict } from "date-fns";
import { QuickActivityChart } from "@/components/quick-activity-chart";
import { RecentActivity } from "@/components/recent-activity";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { QuickActions } from "@/components/quick-actions";
import { useToast } from "@/hooks/use-toast";
import { User, Transaction, Notification } from "@/types";
import { authApi, transactionApi, walletApi, notificationApi } from "@/lib/api-service";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      fetchNotifications(user.id);
      setLoading(false);
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (err: any) {
      console.error("Failed to fetch user details", err);
      setError("Failed to load user data.");
      router.push("/login");
    }
  };

  const fetchBalance = async (userId: number) => {
    try {
      const walletData = await walletApi.getUserWallet(userId);
      if (walletData) {
        setBalance(walletData.balance);
      } else {
        // Wallet doesn't exist yet, create a new one
        console.log("No wallet found, creating a new one...");
        const newWallet = await walletApi.createWallet({ userId, balance: 0, currency: 'INR' });
        setBalance(newWallet.balance);
      }
    } catch (err: any) {
      console.error("Failed to fetch or create wallet", err);
      setError("Failed to load wallet.");
    }
  };

  const fetchTransactions = async (userId: number) => {
    try {
      const transactionData = await transactionApi.getUserTransactions(userId);
      setTransactions(transactionData);
    } catch (err: any) {
      console.error("Failed to fetch transactions", err);
      setError("Failed to load transactions.");
    }
  };

  const fetchNotifications = async (userId: number) => {
    try {
      const notificationData = await notificationApi.getUserNotifications(userId);
      setNotifications(notificationData);
    } catch (err: any) {
      console.error("Failed to fetch notifications", err);
      setError("Failed to load notifications.");
    }
  };

  const handleAddMoney = async (amount: number) => {
    if (amount && user) {
      try {
        await api.post("/wallets/credit", {
          userId: user.id,
          amount: Number.parseFloat(amount.toString()),
        });
        fetchBalance(user.id);
        fetchTransactions(user.id);
        toast({
          title: "Money Added Successfully!",
          description: `$${amount.toFixed(2)} has been added to your wallet.`,
          variant: "success",
        });
      } catch (err: any) {
        console.error("Failed to add money", err);
        toast({
          title: "Failed to Add Money",
          description: "There was an error adding money to your wallet. Please try again.",
          variant: "destructive",
        });
        setError("Failed to add money.");
      }
    }
  };

  const handleSendMoney = async (recipientEmail: string, amount: number) => {
    if (recipientEmail && amount && user) {
      try {
        await api.post("/transactions", {
          senderId: user.id,
          recipientEmail,
          amount: Number.parseFloat(amount.toString()),
        });
        fetchBalance(user.id);
        fetchTransactions(user.id);
        fetchNotifications(user.id);
        toast({
          title: "Money Sent Successfully!",
          description: `$${amount.toFixed(2)} has been sent to ${recipientEmail}.`,
          variant: "success",
        });
      } catch (err: any) {
        console.error("Failed to send money", err);
        toast({
          title: "Failed to Send Money",
          description: "There was an error sending money. Please check your balance and try again.",
          variant: "destructive",
        });
        setError("Failed to send money.");
      }
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // In a real application, you would send an API request here to mark them as read on the server.
  };

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // In a real application, you would send an API request here to mark it as read on the server.
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Memoize processed transactions for display
  const processedTransactions = useMemo(() => {
    if (!user) return [];
    return transactions
      .map((tx) => {
        const isSender = tx.senderId === user.id;
        const type = isSender ? "DEBIT" : "CREDIT";
        let statusColor = "text-muted-foreground";
        let statusBadgeVariant:
          | "default"
          | "destructive"
          | "secondary"
          | "outline" = "default";
        let tooltipContent = "";

        if (tx.status === "completed") {
          statusColor = "text-paypal-accent";
          statusBadgeVariant = "default";
        } else if (tx.status === "failed") {
          statusColor = "text-destructive";
          statusBadgeVariant = "destructive";
          tooltipContent = tx.status.replace("FAILED: ", "");
        } else {
          statusColor = "text-orange-500";
          statusBadgeVariant = "secondary"; // Use secondary for pending/other
        }

        return {
          ...tx,
          type,
          statusColor,
          statusBadgeVariant,
          tooltipContent,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [transactions, user]);

  if (loading) {
    return (
      <DashboardLayout
        userName="Loading..."
        onLogout={() => {}}
        notifications={[]}
        onMarkAllNotificationsAsRead={() => {}}
        onMarkAsRead={() => {}} // Pass a dummy function to satisfy the prop requirement
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-destructive">
        Error: {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Redirecting...
      </div>
    );
  }

  return (
    <DashboardLayout
      userName={`${user.firstName} ${user.lastName}`}
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      onMarkAsRead={handleMarkNotificationAsRead}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Card */}
        <Card
          id="wallet"
          className="col-span-full md:col-span-2 lg:col-span-3 bg-card shadow-lg border border-border"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-muted-foreground">
              Current Balance
            </CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-extrabold text-paypal-primary">
              {balance.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your available funds
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-paypal-primary hover:bg-paypal-primary/90 text-paypal-primary-foreground px-6 py-3 text-base font-semibold rounded-lg shadow-md"
                onClick={() => setShowAddMoneyModal(true)}
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Add Money
              </Button>
              <Button
                variant="outline"
                className="border-paypal-accent text-paypal-accent hover:bg-paypal-accent/10 bg-transparent px-6 py-3 text-base font-semibold rounded-lg shadow-sm"
                onClick={() => setShowSendMoneyModal(true)}
              >
                <Send className="mr-2 h-5 w-5" /> Send Money
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions 
          onAddMoney={() => setShowAddMoneyModal(true)}
          onSendMoney={() => setShowSendMoneyModal(true)}
        />

<div className="col-span-full">
          <RecentActivity transactions={transactions} userId={user.id} />
        </div>
      </div>
      <AddMoneyModal
        show={showAddMoneyModal}
        handleClose={() => setShowAddMoneyModal(false)}
        handleAddMoney={handleAddMoney}
      />
      <SendMoneyModal
        show={showSendMoneyModal}
        handleClose={() => setShowSendMoneyModal(false)}
        handleSendMoney={handleSendMoney}
      />
    </DashboardLayout>
  );
}
