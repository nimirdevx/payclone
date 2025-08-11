"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types";
import { requestApi, userApi } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";

interface MoneyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onRequestCreated: () => void;
}

export function MoneyRequestModal({
  isOpen,
  onClose,
  currentUser,
  onRequestCreated,
}: MoneyRequestModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    amount: "",
    message: "",
  });

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const users = await userApi.searchUsers(query);
      setSearchResults(users.filter(user => user.id !== currentUser.id));
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedUser || !formData.amount || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await requestApi.createRequest({
        requesterId: currentUser.id,
        recipientId: selectedUser.id,
        amount: parseFloat(formData.amount),
        message: formData.message,
      });

      toast({
        title: "Success",
        description: "Money request sent successfully",
      });

      onRequestCreated();
      onClose();
      setFormData({ recipientEmail: "", amount: "", message: "" });
      setSelectedUser(null);
      setSearchResults([]);
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: "Failed to send money request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Money</DialogTitle>
          <DialogDescription>
            Send a money request to another user
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Search Recipient</Label>
            <Input
              id="recipient"
              placeholder="Search by name or email..."
              value={formData.recipientEmail}
              onChange={(e) => {
                setFormData({ ...formData, recipientEmail: e.target.value });
                handleSearchUsers(e.target.value);
              }}
            />
            
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-32 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user);
                      setFormData({ ...formData, recipientEmail: `${user.firstName} ${user.lastName}` });
                      setSearchResults([]);
                    }}
                  >
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="What's this request for?"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateRequest} disabled={loading}>
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
