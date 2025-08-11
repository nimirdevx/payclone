"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Send, HandCoins, QrCode, CreditCard, Smartphone } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  onAddMoney: () => void;
  onSendMoney: () => void;
}

export function QuickActions({ onAddMoney, onSendMoney }: QuickActionsProps) {
  return (
    <Card className="bg-gradient-to-br from-paypal-primary to-paypal-accent text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onAddMoney}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-auto p-4 flex-col gap-2"
            variant="outline"
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-sm font-medium">Add Money</span>
          </Button>
          
          <Button
            onClick={onSendMoney}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-auto p-4 flex-col gap-2"
            variant="outline"
          >
            <Send className="h-6 w-6" />
            <span className="text-sm font-medium">Send Money</span>
          </Button>
          
          <Link href="/request" className="contents">
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-auto p-4 flex-col gap-2"
              variant="outline"
            >
              <HandCoins className="h-6 w-6" />
              <span className="text-sm font-medium">Request</span>
            </Button>
          </Link>
          
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-auto p-4 flex-col gap-2"
            variant="outline"
            disabled
          >
            <QrCode className="h-6 w-6" />
            <span className="text-sm font-medium">QR Pay</span>
          </Button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <Link href="/transactions">
            <Button
              variant="ghost"
              className="w-full text-white hover:bg-white/10 justify-start"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View All Transactions
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
