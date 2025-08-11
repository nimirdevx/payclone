"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Sankey, Legend, Cell } from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, ArrowLeftRight, Activity, CalendarDays } from 'lucide-react';
import { Transaction } from "@/types";

interface AdvancedAnalyticsProps {
  transactions: Transaction[];
  userId: number;
  balance: number;
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-xs bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        {payload.map((pld: any, index: number) => (
          <div key={index} style={{ color: pld.color }}>
            {`${pld.name}: ₹${pld.value.toFixed(2)}`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AdvancedAnalytics({ transactions, userId, balance }: AdvancedAnalyticsProps) {
  
  // Memoized calculations for performance
  const analyticsData = useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status.toLowerCase() === 'completed');
    
    const totalInflow = completedTransactions
      .filter(t => t.recipientId === userId)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflow = completedTransactions
      .filter(t => t.senderId === userId)
      .reduce((sum, t) => sum + t.amount, 0);

    const netFlow = totalInflow - totalOutflow;
    const totalVolume = totalInflow + totalOutflow;

    // --- Data for Daily Trend Area Chart ---
    const dateRange = completedTransactions.length > 0 ? eachDayOfInterval({
        start: new Date(Math.min(...completedTransactions.map(t => new Date(t.timestamp).getTime()))),
        end: new Date()
    }) : eachDayOfInterval({ start: subDays(new Date(), 30), end: new Date() });

    const dailyTrends = dateRange.map(date => {
        const dayStart = startOfDay(date);
        const dailySent = completedTransactions
            .filter(t => t.senderId === userId && startOfDay(new Date(t.timestamp)).getTime() === dayStart.getTime())
            .reduce((sum, t) => sum + t.amount, 0);
        const dailyReceived = completedTransactions
            .filter(t => t.recipientId === userId && startOfDay(new Date(t.timestamp)).getTime() === dayStart.getTime())
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            date: format(dayStart, 'MMM dd'),
            Sent: dailySent,
            Received: dailyReceived
        };
    });

    // --- Data for Sankey Chart (Transaction Flow) ---
    const nodes = [
        { name: 'Income Sources' },
        { name: 'Your Wallet' },
        { name: 'External Recipients' }
    ];
    const links = [
        { source: 0, target: 1, value: totalInflow || 1, color: '#22c55e' }, // Sankey needs non-zero value
        { source: 1, target: 2, value: totalOutflow || 1, color: '#ef4444' }
    ];
    const sankeyData = { nodes, links };

    // --- Data for Calendar Heatmap ---
    const calendarData = Array.from({ length: 365 }, (_, i) => {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const count = completedTransactions.filter(t => startOfDay(new Date(t.timestamp)).getTime() === dayStart.getTime()).length;
        return { date: format(dayStart, 'yyyy-MM-dd'), count };
    }).reverse();


    return { totalInflow, totalOutflow, netFlow, totalVolume, dailyTrends, sankeyData, calendarData };
  }, [transactions, userId]);

  const { totalInflow, totalOutflow, netFlow, totalVolume, dailyTrends, sankeyData, calendarData } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netFlow >= 0 ? '+' : '-'}₹{Math.abs(netFlow).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Income vs. Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalVolume.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total money moved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inflow</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+₹{totalInflow.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total money received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outflow</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-₹{totalOutflow.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total money sent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Daily Trend Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Daily Trend
            </CardTitle>
            <CardDescription>Sent vs. Received activity over the period.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrends} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value}`} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="Sent" stroke="#ef4444" fill="url(#colorSent)" />
                <Area type="monotone" dataKey="Received" stroke="#22c55e" fill="url(#colorReceived)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Flow (Sankey Chart) */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5" />
                    Transaction Flow
                </CardTitle>
                <CardDescription>How your money flows through your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <Sankey
                        data={sankeyData}
                        node={{ stroke: '#777', strokeWidth: 2 }}
                        nodePadding={50}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        link={{ strokeOpacity: 0.5 }}
                    >
                        <Tooltip />
                    </Sankey>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Activity Heatmap
            </CardTitle>
            <CardDescription>Your transaction frequency over the last year.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
            <ResponsiveContainer width="100%" height={150}>
                <BarChart data={calendarData}>
                    <Tooltip 
                        contentStyle={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid #ccc', borderRadius: '5px' }}
                        labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
                        formatter={(value: any, name: any, props: any) => [`${props.payload.count} transactions`, '']}
                    />
                    <XAxis dataKey="date" tickFormatter={() => ''} tickLine={false} axisLine={false} />
                    <Bar dataKey="count" >
                        {calendarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.count > 0 ? `rgba(34, 197, 94, ${Math.min(0.2 + entry.count / 5, 1)})` : '#eaeaea'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
