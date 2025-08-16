"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HandCoins, Send, Check, X, Clock, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatDistanceToNowStrict } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MoneyRequest, User, Notification } from "@/types";
import { requestApi, userApi, authApi, notificationApi } from "@/lib/api-service";

export default function RequestMoneyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<MoneyRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newRequest, setNewRequest] = useState({
    recipientEmail: "",
    amount: "",
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = await authApi.getMe();
        setUser(currentUser);
        await Promise.all([
          fetchIncomingRequests(),
          fetchOutgoingRequests(),
          fetchNotifications(currentUser.id),
          fetchUnreadCount(currentUser.id)
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to load data." });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, toast]);

  const fetchIncomingRequests = async () => {
    try {
      const response = await requestApi.getIncomingRequests();
      setIncomingRequests(response);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const response = await requestApi.getOutgoingRequests();
      setOutgoingRequests(response);
    } catch (error) {
      console.error("Error fetching outgoing requests:", error);
    }
  };

  const fetchNotifications = async (userId: number) => {
    try {
      const data = await notificationApi.getUserNotifications(userId);
      setNotifications(data);
    } catch (err) {
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

  const handleCreateRequest = async () => {
    if (!user || !newRequest.recipientEmail || !newRequest.amount) {
      toast({ variant: "destructive", title: "Error", description: "Recipient and amount required." });
      return;
    }
    try {
      const userResponse = await userApi.searchUsers(newRequest.recipientEmail);
      const recipient = userResponse.find((u: User) => u.email === newRequest.recipientEmail);
      if (!recipient) {
        toast({ variant: "destructive", title: "Error", description: "Recipient not found." });
        return;
      }
      await requestApi.createRequest({
        requesterId: user.id,
        recipientId: recipient.id,
        amount: parseFloat(newRequest.amount),
        message: newRequest.message,
      });
      toast({ title: "Success", description: "Request sent successfully." });
      setShowCreateModal(false);
      setNewRequest({ recipientEmail: "", amount: "", message: "" });
      fetchOutgoingRequests();
      fetchNotifications(user.id);
      fetchUnreadCount(user.id);
    } catch (error) {
      console.error("Error creating request:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send request." });
    }
  };

  const handleRequestAction = async (requestId: number, action: "approve" | "reject") => {
    if (!user) return;
    try {
      if (action === "approve") {
        await requestApi.approveRequest(requestId);
        toast({ title: "Success", description: "Request approved." });
      } else {
        await requestApi.rejectRequest(requestId);
        toast({ title: "Request Rejected" });
      }
      fetchIncomingRequests();
      fetchNotifications(user.id);
      fetchUnreadCount(user.id);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({ variant: "destructive", title: "Error", description: `Failed to ${action} request.` });
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!user) return;
    try {
      await requestApi.cancelRequest(requestId);
      toast({ title: "Success", description: "Request cancelled." });
      fetchOutgoingRequests();
      fetchNotifications(user.id);
      fetchUnreadCount(user.id);
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to cancel request." });
    }
  };
  
  const getStatusBadge = (status: string) => {
    const styleMap: { [key: string]: string } = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={styleMap[status] || "bg-gray-100"}>{status}</Badge>;
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
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
        <div className="space-y-6">
          <div className="flex justify-between items-center"><div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></div><Skeleton className="h-10 w-32" /></div>
          <Card><CardHeader><Skeleton className="h-10 w-full" /></CardHeader></Card>
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        </div>
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div><h1 className="text-3xl font-bold flex items-center gap-2"><HandCoins className="h-8 w-8" />Money Requests</h1><p className="text-muted-foreground">Request and manage money requests</p></div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild><Button className="flex items-center gap-2"><Plus className="h-4 w-4" />New Request</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Money</DialogTitle><DialogDescription>Send a money request to another user.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div><Label htmlFor="recipientEmail">Recipient Email</Label><Input id="recipientEmail" placeholder="recipient@example.com" value={newRequest.recipientEmail} onChange={(e) => setNewRequest(p => ({ ...p, recipientEmail: e.target.value }))} /></div>
                <div><Label htmlFor="amount">Amount (₹)</Label><Input id="amount" type="number" placeholder="0.00" value={newRequest.amount} onChange={(e) => setNewRequest(p => ({ ...p, amount: e.target.value }))} /></div>
                <div><Label htmlFor="message">Message</Label><Textarea id="message" placeholder="What's this for?" value={newRequest.message} onChange={(e) => setNewRequest(p => ({ ...p, message: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button onClick={handleCreateRequest} disabled={!newRequest.recipientEmail || !newRequest.amount}><Send className="h-4 w-4 mr-2" />Send Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" className="flex items-center gap-2">Incoming{incomingRequests.filter(r => r.status === "pending").length > 0 && <Badge variant="destructive">{incomingRequests.filter(r => r.status === "pending").length}</Badge>}</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming" className="space-y-4">
            {incomingRequests.length === 0 ? <Card><CardContent className="py-12 text-center"><HandCoins className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-semibold">No incoming requests</h3></CardContent></Card> : incomingRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">From: User {req.requesterId}</p>
                    <p className="text-2xl font-bold">₹{req.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">"{req.message}"</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNowStrict(new Date(req.timestamp), { addSuffix: true })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(req.status)}
                    {req.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleRequestAction(req.id, "reject")}><X className="h-4 w-4" /></Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRequestAction(req.id, "approve")}><Check className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="outgoing" className="space-y-4">
            {outgoingRequests.length === 0 ? <Card><CardContent className="py-12 text-center"><Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="font-semibold">No outgoing requests</h3></CardContent></Card> : outgoingRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">To: User {req.recipientId}</p>
                    <p className="text-2xl font-bold">₹{req.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">"{req.message}"</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNowStrict(new Date(req.timestamp), { addSuffix: true })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(req.status)}
                    {req.status === "pending" && <Button size="sm" variant="outline" onClick={() => handleCancelRequest(req.id)}>Cancel</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}