"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Send, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AddMoneyModal } from "@/components/add-money-modal";
import { SendMoneyModal } from "@/components/send-money-modal";
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
  const [unreadCount, setUnreadCount] = useState(0);
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
      fetchUnreadCount(user.id);
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
        const newWallet = await walletApi.createWallet({ userId });
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
    }
  };

  const fetchUnreadCount = async (userId: number) => {
    try {
      const data = await notificationApi.getUnreadCount(userId);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const handleAddMoney = async (amount: number) => {
    if (amount && user) {
      try {
        await walletApi.addMoney(user.id, amount);
        fetchBalance(user.id);
        fetchTransactions(user.id);
        fetchNotifications(user.id);
        fetchUnreadCount(user.id);
        toast({ title: "Money Added Successfully!", description: `₹${amount.toFixed(2)} has been added to your wallet.`, variant: "success" });
      } catch (err: any) {
        console.error("Failed to add money", err);
        toast({ title: "Failed to Add Money", description: "There was an error adding money. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleSendMoney = async (recipientEmail: string, amount: number, description: string) => {
    if (recipientEmail && amount && user) {
      try {
        await transactionApi.createTransaction({ senderId: user.id, recipientEmail, amount, description });
        fetchBalance(user.id);
        fetchTransactions(user.id);
        fetchNotifications(user.id);
        fetchUnreadCount(user.id);
        toast({ title: "Money Sent Successfully!", description: `₹${amount.toFixed(2)} has been sent to ${recipientEmail}.`, variant: "success" });
      } catch (err: any) {
        console.error("Failed to send money", err);
        toast({ title: "Failed to Send Money", description: err.response?.data?.message || "Check your balance and try again.", variant: "destructive" });
      }
    }
  };
  
  const handleMarkAllNotificationsAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead(user.id);
    } catch (error) {
      if (user) {
        fetchNotifications(user.id);
        fetchUnreadCount(user.id);
      }
    }
  };

  const handleMarkNotificationAsRead = async (id: number) => {
    if (!user) return;
    const isUnread = notifications.find(n => n.id === id)?.read === false;
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationApi.markAsRead(id);
    } catch (error) {
      if (user) {
        fetchNotifications(user.id);
        fetchUnreadCount(user.id);
      }
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!user) return;
    const isUnread = notifications.find(n => n.id === id)?.read === false;
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (isUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationApi.deleteNotification(id);
    } catch (error) {
      if (user) {
        fetchNotifications(user.id);
        fetchUnreadCount(user.id);
      }
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
        unreadCount={0}
        onMarkAllNotificationsAsRead={() => {}}
        onMarkAsRead={() => {}}
        onDeleteNotification={() => {}}
      >
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={`${user.firstName} ${user.lastName}`}
      onLogout={handleLogout}
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      onMarkAsRead={handleMarkNotificationAsRead}
      onDeleteNotification={handleDeleteNotification}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card id="wallet" className="col-span-full md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-muted-foreground">Current Balance</CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-extrabold text-paypal-primary">
              {balance.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Your available funds</p>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowAddMoneyModal(true)}><PlusCircle className="mr-2 h-5 w-5" /> Add Money</Button>
              <Button variant="outline" onClick={() => setShowSendMoneyModal(true)}><Send className="mr-2 h-5 w-5" /> Send Money</Button>
            </div>
          </CardContent>
        </Card>
        <QuickActions onAddMoney={() => setShowAddMoneyModal(true)} onSendMoney={() => setShowSendMoneyModal(true)} />
        <div className="col-span-full">
          <RecentActivity transactions={transactions} userId={user.id} />
        </div>
      </div>
      <AddMoneyModal show={showAddMoneyModal} handleClose={() => setShowAddMoneyModal(false)} handleAddMoney={handleAddMoney} />
      <SendMoneyModal show={showSendMoneyModal} handleClose={() => setShowSendMoneyModal(false)} handleSendMoney={handleSendMoney} />
    </DashboardLayout>
  );
}