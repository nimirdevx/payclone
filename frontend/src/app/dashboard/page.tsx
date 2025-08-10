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
import { DashboardSkeleton } from "@/components/dashboard-skeleton"; // Import the new skeleton

interface User {
  id: number;
  name: string;
  email: string;
}

interface Transaction {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  status: string;
  timestamp: string;
}

interface Notification {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
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
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (err: any) {
      console.error("Failed to fetch user details", err);
      setError("Failed to load user data.");
      router.push("/login");
    }
  };

  const fetchBalance = async (userId: number) => {
    try {
      const response = await api.get(`/wallets/user/${userId}`);
      setBalance(response.data.balance);
    } catch (err: any) {
      console.error("Failed to fetch balance", err);
      setError("Failed to load balance.");
    }
  };

  const fetchTransactions = async (userId: number) => {
    try {
      const response = await api.get(`/transactions/user/${userId}`);
      setTransactions(response.data);
    } catch (err: any) {
      console.error("Failed to fetch transactions", err);
      setError("Failed to load transactions.");
    }
  };

  const fetchNotifications = async (userId: number) => {
    try {
      const response = await api.get(`/notifications/user`, {
        params: { id: userId },
      });
      setNotifications(response.data.notifications);
    } catch (err: any) {
      console.error("Failed to fetch notifications", err);
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
      } catch (err: any) {
        console.error("Failed to add money", err);
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
      } catch (err: any) {
        console.error("Failed to send money", err);
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

        if (tx.status === "COMPLETED") {
          statusColor = "text-paypal-accent";
          statusBadgeVariant = "default";
        } else if (tx.status.startsWith("FAILED")) {
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
      userName={user.name}
      onLogout={handleLogout}
      notifications={notifications}
      onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      onMarkAsRead={handleMarkNotificationAsRead}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Wallet Card */}
        <Card
          id="wallet"
          className="col-span-full md:col-span-2 lg:col-span-2 bg-card shadow-lg border border-border"
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
                <PlusCircle className="mr-2 h-5 w-5" /> Credit Wallet
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

        {/* Quick Activity Chart */}
        <QuickActivityChart transactions={transactions} userId={user.id} />

        {/* Transactions Section */}
        <Card
          id="transactions"
          className="col-span-full bg-card shadow-lg border border-border"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-muted-foreground">
              Transaction History
            </CardTitle>
            <Repeat2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedTransactions.length > 0 ? (
                  processedTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Badge
                          variant={
                            tx.type === "DEBIT" ? "destructive" : "default"
                          }
                          className={
                            tx.type === "DEBIT"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-paypal-accent/10 text-paypal-accent"
                          }
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${
                          tx.type === "DEBIT"
                            ? "text-destructive"
                            : "text-paypal-accent"
                        }`}
                      >
                        {tx.type === "DEBIT" ? "-" : "+"}
                        {tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {tx.type === "DEBIT"
                          ? `User ${tx.recipientId}`
                          : `User ${tx.senderId}`}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {tx.status.startsWith("FAILED") ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="destructive"
                                  className="cursor-help bg-destructive/10 text-destructive"
                                >
                                  Failed
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{tx.tooltipContent}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-green-500/10 text-green-600"
                          >
                            {" "}
                            {/* Assuming green for completed */}
                            {tx.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(tx.timestamp), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No transactions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
