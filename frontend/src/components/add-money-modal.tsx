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

interface AddMoneyModalProps {
  show: boolean;
  handleClose: () => void;
  handleAddMoney: (amount: number) => void;
}

export function AddMoneyModal({
  show,
  handleClose,
  handleAddMoney,
}: AddMoneyModalProps) {
  const [amount, setAmount] = useState("");
  const quickAmounts = [500, 5000, 50000];

  const handleSubmit = () => {
    const numAmount = Number.parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      handleAddMoney(numAmount);
      setAmount("");
      handleClose();
    }
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Credit Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to add to your wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
              placeholder="e.g., 100.00"
              min="0"
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
          className="bg-paypal-primary hover:bg-paypal-primary/90 text-paypal-primary-foreground"
        >
          Add Money
        </Button>
      </DialogContent>
    </Dialog>
  );
}
