"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SendMoneyModalProps {
  show: boolean;
  handleClose: () => void;
  handleSendMoney: (recipientEmail: string, amount: number, description: string) => void;
}

export function SendMoneyModal({
  show,
  handleClose,
  handleSendMoney,
}: SendMoneyModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const quickAmounts = [500, 5000, 50000];

  const handleSubmit = () => {
    const numAmount = Number.parseFloat(amount);
    if (recipientEmail && !isNaN(numAmount) && numAmount > 0) {
      handleSendMoney(recipientEmail, numAmount, description);
      setRecipientEmail("");
      setAmount("");
      setDescription("");
      handleClose();
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            Enter the recipient's email and the amount to send.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipientEmail" className="text-right">
              Recipient Email
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="col-span-3"
              placeholder="recipient@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 50.00"
              min="0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Note
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="(Optional)"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {quickAmounts.map((qAmount) => (
              <Button
                key={qAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(qAmount.toString())}
                className="border-paypal-accent text-paypal-accent hover:bg-paypal-accent/10"
              >
                {qAmount.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                })}
              </Button>
            ))}
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          className="bg-paypal-accent hover:bg-paypal-accent/90 text-paypal-accent-foreground"
        >
          Send Money
        </Button>
      </DialogContent>
    </Dialog>
  );
}