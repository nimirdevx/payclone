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
import api from "@/lib/api";

interface MoneyRequest {
  id: number;
  requesterId: number;
  recipientId: number;
  amount: number;
  message: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  requesterName?: string;
  recipientName?: string;
}

export default function RequestMoneyPage() {
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<MoneyRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState({
    recipientEmail: "",
    amount: "",
    message: "",
  });

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
      fetchRequests();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (err: any) {
      setUser({ id: 1, name: "John Doe", email: "john.doe@example.com" });
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Mock data for development
      const mockIncoming = [
        {
          id: 1,
          requesterId: 2,
          recipientId: 1,
          amount: 150.00,
          message: "Dinner split from last night",
          status: "pending" as const,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          requesterName: "John Doe",
        },
        {
          id: 2,
          requesterId: 3,
          recipientId: 1,
          amount: 75.50,
          message: "Movie tickets reimbursement",
          status: "pending" as const,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          requesterName: "Jane Smith",
        },
      ];

      const mockOutgoing = [
        {
          id: 3,
          requesterId: 1,
          recipientId: 4,
          amount: 200.00,
          message: "Rent contribution",
          status: "approved" as const,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          recipientName: "Alice Johnson",
        },
        {
          id: 4,
          requesterId: 1,
          recipientId: 5,
          amount: 50.00,
          message: "Lunch money",
          status: "pending" as const,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          recipientName: "Bob Wilson",
        },
      ];

      setIncomingRequests(mockIncoming);
      setOutgoingRequests(mockOutgoing);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const requestData = {
        recipientEmail: newRequest.recipientEmail,
        amount: parseFloat(newRequest.amount),
        message: newRequest.message,
      };

      // Mock API call
      console.log("Creating request:", requestData);
      
      // Add to outgoing requests (mock)
      const newRequestObj = {
        id: Date.now(),
        requesterId: 1,
        recipientId: Math.floor(Math.random() * 100) + 2,
        amount: requestData.amount,
        message: requestData.message,
        status: "pending" as const,
        timestamp: new Date().toISOString(),
        recipientName: newRequest.recipientEmail.split("@")[0],
      };

      setOutgoingRequests(prev => [newRequestObj, ...prev]);
      setShowCreateModal(false);
      setNewRequest({ recipientEmail: "", amount: "", message: "" });
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  const handleRequestAction = async (requestId: number, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token");
      
      // Mock API call
      console.log(`${action}ing request:`, requestId);
      
      setIncomingRequests(prev =>
        prev.map(request =>
          request.id === requestId
            ? { ...request, status: action === "approve" ? "approved" : "rejected" }
            : request
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex border-b">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-16" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
      onMarkAllNotificationsAsRead={() => {}}
      onMarkAsRead={() => {}}
    >
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HandCoins className="h-8 w-8" />
              Money Requests
            </h1>
            <p className="text-muted-foreground">
              Request and manage money requests
            </p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Money</DialogTitle>
                <DialogDescription>
                  Send a money request to another user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    placeholder="Enter recipient's email"
                    value={newRequest.recipientEmail}
                    onChange={(e) =>
                      setNewRequest(prev => ({ ...prev, recipientEmail: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newRequest.amount}
                    onChange={(e) =>
                      setNewRequest(prev => ({ ...prev, amount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="What's this request for?"
                    value={newRequest.message}
                    onChange={(e) =>
                      setNewRequest(prev => ({ ...prev, message: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRequest}
                  disabled={!newRequest.recipientEmail || !newRequest.amount}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" className="flex items-center gap-2">
              Incoming Requests
              {incomingRequests.filter(r => r.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {incomingRequests.filter(r => r.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center gap-2">
              Outgoing Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <HandCoins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No incoming requests</h3>
                  <p className="text-muted-foreground">
                    You don't have any money requests at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              incomingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            ${request.amount.toFixed(2)}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-1">
                          From: <span className="font-medium">{request.requesterName}</span>
                        </p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mb-2">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(request.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAction(request.id, "reject")}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRequestAction(request.id, "approve")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No outgoing requests</h3>
                  <p className="text-muted-foreground">
                    You haven't sent any money requests yet.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              outgoingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            ${request.amount.toFixed(2)}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-1">
                          To: <span className="font-medium">{request.recipientName}</span>
                        </p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground mb-2">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(request.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "pending" && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        {request.status === "approved" && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {request.status === "rejected" && (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
