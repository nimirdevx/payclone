"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SendMoneyModalProps {
  show: boolean;
  handleClose: () => void;
  handleSendMoney: (recipientEmail: string, amount: number) => void; // Ensure handleSendMoney expects a number
}

export function SendMoneyModal({
  show,
  handleClose,
  handleSendMoney,
}: SendMoneyModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientEmail && amount) {
      handleSendMoney(recipientEmail, Number.parseFloat(amount)); // Use parseFloat as per your Dashboard's handleSendMoney
      setRecipientEmail("");
      setAmount("");
      handleClose();
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-paypal-primary">Send Money</DialogTitle>
          <DialogDescription>
            Enter recipient's email and amount to send.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipientEmail" className="text-right">
              Recipient Email
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="col-span-3 focus-visible:ring-paypal-primary"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3 focus-visible:ring-paypal-primary"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-paypal-primary hover:bg-paypal-primary/90 text-paypal-primary-foreground"
            >
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
