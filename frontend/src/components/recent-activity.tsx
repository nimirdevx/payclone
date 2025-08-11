"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, subDays, startOfDay } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  status: string;
  timestamp: string;
  description?: string | null;
}

interface RecentActivityProps {
  transactions: Transaction[];
  userId: number;
}

export function RecentActivity({ transactions, userId }: RecentActivityProps) {
  const router = useRouter();

  // --- Chart and Summary Data Aggregation ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, "MMM dd"),
      fullDate: startOfDay(date),
      Sent: 0,
      Received: 0,
    };
  });

  const dailyActivity = transactions.reduce((acc, tx) => {
    const txDate = startOfDay(new Date(tx.timestamp));
    const dayData = acc.find(day => day.fullDate.getTime() === txDate.getTime());
    
    if (dayData && tx.status.toLowerCase() === "completed") {
      if (tx.senderId === userId) {
        dayData.Sent += tx.amount;
      } else if (tx.recipientId === userId) {
        dayData.Received += tx.amount;
      }
    }
    return acc;
  }, last7Days);

  const chartConfig = {
    Received: { label: "Received", color: "hsl(var(--chart-2))" },
    Sent: { label: "Sent", color: "hsl(var(--chart-1))" },
  };

  // --- Calculations for Summary Cards ---
  const totalSent = dailyActivity.reduce((sum, day) => sum + day.Sent, 0);
  const totalReceived = dailyActivity.reduce((sum, day) => sum + day.Received, 0);
  const netFlow = totalReceived - totalSent;

  // --- Transaction List Logic ---
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>An overview of your transactions from the last 7 days.</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/transactions')}>
          <ArrowUpRight className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-red-500">-₹{totalSent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">in the last 7 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-green-500">+₹{totalReceived.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">in the last 7 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {netFlow >= 0 ? '+' : '-'}₹{Math.abs(netFlow).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Your 7-day balance change</p>
                </CardContent>
            </Card>
        </div>

        {/* Area Chart */}
        <div className="space-y-2">
            <h3 className="text-md font-semibold">Activity Graph</h3>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer>
                <AreaChart data={dailyActivity} margin={{ left: 12, right: 12, top: 10 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `₹${value}`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <defs>
                    <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-Sent)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-Sent)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-Received)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-Received)" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <Area
                    dataKey="Sent"
                    type="natural"
                    fill="url(#fillSent)"
                    stroke="var(--color-Sent)"
                    stackId="a"
                />
                <Area
                    dataKey="Received"
                    type="natural"
                    fill="url(#fillReceived)"
                    stroke="var(--color-Received)"
                    stackId="a"
                />
                </AreaChart>
            </ResponsiveContainer>
            </ChartContainer>
        </div>

        {/* Compact Transaction List */}
        <div className="space-y-2">
            <h3 className="text-md font-semibold">Latest Transactions</h3>
            <div className="rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map(tx => {
                                const isDebit = tx.senderId === userId;
                                return (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <Badge variant={isDebit ? "destructive" : "default"} className={isDebit ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-600"}>
                                            {isDebit ? 'Sent' : 'Received'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">
                                            {isDebit ? `To User ${tx.recipientId}` : `From User ${tx.senderId}`}
                                        </div>
                                        <div className="text-xs text-muted-foreground hidden sm:block">
                                            {tx.description || 'No description'}
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${isDebit ? 'text-red-500' : 'text-green-600'}`}>
                                        {isDebit ? '-' : '+'}₹{tx.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24">
                                    No recent transactions.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}