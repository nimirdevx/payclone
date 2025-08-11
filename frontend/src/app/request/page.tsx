"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HandCoins, Send, Check, X, Clock, Plus, Search, User as UserIcon } from "lucide-react";
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
import { MoneyRequest, User } from "@/types";
import { requestApi, userApi, authApi } from "@/lib/api-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function RequestMoneyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<MoneyRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MoneyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState({
    recipientEmail: "",
    amount: "",
    message: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchIncomingRequests(),
          fetchOutgoingRequests(),
          fetchCurrentUser()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getMe();
      setUser(response);
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  };
  
  const fetchIncomingRequests = async () => {
    try {
      const response = await requestApi.getIncomingRequests();
      setIncomingRequests(response);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      setIncomingRequests([]);
    }
  };
  
  const fetchOutgoingRequests = async () => {
    try {
      const response = await requestApi.getOutgoingRequests();
      setOutgoingRequests(response);
    } catch (error) {
      console.error("Error fetching outgoing requests:", error);
      setOutgoingRequests([]);
    }
  };
  
  const handleSearchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await userApi.searchUsers(query);
      const currentUser = user?.id;
      setSearchResults(response.filter((u: User) => u.id !== currentUser));
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search users. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.recipientEmail || !newRequest.amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter recipient email and amount",
      });
      return;
    }
    
    try {
      const amount = parseFloat(newRequest.amount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid amount",
        });
        return;
      }
      
      let recipientId: number | null = null;
      const recipient = searchResults.find(u => u.email === newRequest.recipientEmail);
      
      if (recipient) {
        recipientId = recipient.id;
      } else {
        try {
          const userResponse = await userApi.searchUsers(newRequest.recipientEmail);
          const matchedUser = userResponse.find((u: User) => u.email === newRequest.recipientEmail);
          if (matchedUser) {
            recipientId = matchedUser.id;
          }
        } catch (err) {
          console.error("Error searching for user:", err);
        }
      }
      
      if (!recipientId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Recipient not found. Please enter a valid email address.",
        });
        return;
      }
      
      await requestApi.createRequest({
        requesterId: user?.id || 0,
        recipientId,
        amount,
        message: newRequest.message || "",
      });
      
      toast({
        title: "Success",
        description: "Request approved successfully",
      });
      setShowCreateModal(false);
      setNewRequest({ recipientEmail: "", amount: "", message: "" });
      setSearchQuery("");
      setSearchResults([]);
      
      await fetchOutgoingRequests();
    } catch (error: any) {
      console.error("Error creating request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to approve request",
      });
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    try {
      await requestApi.approveRequest(requestId);
      toast({
        title: "Success",
        description: "Request approved successfully",
      });
      await fetchIncomingRequests();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to approve request",
      });
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await requestApi.cancelRequest(requestId);
      toast({
        title: "Success",
        description: "Request cancelled",
      });
      await fetchOutgoingRequests();
    } catch (error: any) {
      console.error("Error cancelling request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel request",
      });
    }
  };

  const handleRequestAction = async (requestId: number, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token");
      
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
    userName={`${user.firstName} ${user.lastName}`}
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
                          From: <span className="font-medium">User {request.requesterId}</span>
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
                          To: <span className="font-medium">User {request.recipientId}</span>
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
