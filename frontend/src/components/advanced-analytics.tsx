"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Transaction {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  status: string;
  timestamp: string;
}

interface AdvancedAnalyticsProps {
  transactions: Transaction[];
  userId: number;
  balance: number;
}

export function AdvancedAnalytics({ transactions, userId, balance }: AdvancedAnalyticsProps) {
  // Calculate analytics
  const completedTransactions = transactions.filter(t => t.status.toLowerCase() === "completed");
  const sentTransactions = completedTransactions.filter(t => t.senderId === userId);
  const receivedTransactions = completedTransactions.filter(t => t.recipientId === userId);
  
  const totalSent = sentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = receivedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const avgTransactionAmount = completedTransactions.length > 0 
    ? (totalSent + totalReceived) / completedTransactions.length 
    : 0;
  
  // Monthly spending analysis
  const monthlyData = completedTransactions.reduce((acc, t) => {
    const month = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { month, sent: 0, received: 0 };
    }
    if (t.senderId === userId) {
      acc[month].sent += t.amount;
    } else {
      acc[month].received += t.amount;
    }
    return acc;
  }, {} as Record<string, { month: string; sent: number; received: number }>);

  const monthlyChartData = Object.values(monthlyData).slice(-6); // Last 6 months

  // Transaction type distribution
  const pieData = [
    { name: 'Sent', value: totalSent, color: '#ef4444' },
    { name: 'Received', value: totalReceived, color: '#22c55e' },
  ];

  // Calculate trends
  const recentTransactions = completedTransactions.slice(0, 10);
  const olderTransactions = completedTransactions.slice(10, 20);
  const recentAvg = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(recentTransactions.length, 1);
  const olderAvg = olderTransactions.reduce((sum, t) => sum + t.amount, 0) / Math.max(olderTransactions.length, 1);
  const trendPercentage = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTransactions.length}</div>
          <p className="text-xs text-muted-foreground">
            {sentTransactions.length} sent, {receivedTransactions.length} received
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${avgTransactionAmount.toFixed(2)}</div>
          <div className="flex items-center gap-1">
            <Badge variant={trendPercentage >= 0 ? "default" : "destructive"} className="text-xs">
              {trendPercentage >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trendPercentage).toFixed(1)}%
            </Badge>
            <span className="text-xs text-muted-foreground">vs previous</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalReceived - totalSent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalReceived - totalSent >= 0 ? '+' : ''}${(totalReceived - totalSent).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {transactions.length > 0 ? ((completedTransactions.length / transactions.length) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {transactions.filter(t => t.status.toLowerCase() === "failed").length} failed
          </p>
        </CardContent>
      </Card>

      {/* Monthly Trend Chart */}
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Activity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, ""]} />
              <Bar dataKey="sent" fill="#ef4444" name="Sent" />
              <Bar dataKey="received" fill="#22c55e" name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Distribution */}
      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Transaction Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Sent: ${totalSent.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Received: ${totalReceived.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
