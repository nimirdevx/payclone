"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, subDays, startOfDay } from "date-fns";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  status: string;
  timestamp: string;
}

interface EnhancedActivityChartProps {
  transactions: Transaction[];
  userId: number;
}

export function EnhancedActivityChart({ transactions, userId }: EnhancedActivityChartProps) {
  // Generate last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, "MMM dd"),
      fullDate: startOfDay(date),
      sent: 0,
      received: 0,
      net: 0,
    };
  });

  // Aggregate daily totals
  const dailyActivity = transactions.reduce((acc, tx) => {
    const txDate = startOfDay(new Date(tx.timestamp));
    const dayData = acc.find(day => day.fullDate.getTime() === txDate.getTime());
    
    if (dayData && tx.status.toLowerCase() === "completed") {
      if (tx.senderId === userId) {
        dayData.sent += tx.amount;
      } else if (tx.recipientId === userId) {
        dayData.received += tx.amount;
      }
      dayData.net = dayData.received - dayData.sent;
    }
    
    return acc;
  }, last7Days);

  // Calculate totals and trends
  const totalSent = dailyActivity.reduce((sum, day) => sum + day.sent, 0);
  const totalReceived = dailyActivity.reduce((sum, day) => sum + day.received, 0);
  const netFlow = totalReceived - totalSent;
  
  // Calculate trend (comparing last 3 days vs previous 4 days)
  const recentActivity = dailyActivity.slice(-3).reduce((sum, day) => sum + day.received + day.sent, 0);
  const previousActivity = dailyActivity.slice(0, 4).reduce((sum, day) => sum + day.received + day.sent, 0);
  const trendPercentage = previousActivity > 0 ? ((recentActivity - previousActivity) / previousActivity) * 100 : 0;

  const chartConfig = {
    sent: {
      label: "Sent",
      color: "hsl(var(--chart-1))",
    },
    received: {
      label: "Received", 
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summary Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">-${totalSent.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Received</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">+${totalReceived.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netFlow >= 0 ? '+' : ''}${netFlow.toFixed(2)}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={trendPercentage >= 0 ? "default" : "destructive"} className="text-xs">
              {trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
            </Badge>
            <p className="text-xs text-muted-foreground">vs previous period</p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Chart */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Weekly Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === "sent" ? "Sent" : "Received"
                  ]}
                />
                <Bar 
                  dataKey="sent" 
                  fill="var(--color-sent)" 
                  radius={[4, 4, 0, 0]}
                  name="sent"
                />
                <Bar 
                  dataKey="received" 
                  fill="var(--color-received)" 
                  radius={[4, 4, 0, 0]}
                  name="received"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
