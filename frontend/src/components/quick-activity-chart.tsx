"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"

interface Transaction {
  id: number
  senderId: number
  recipientId: number
  amount: number
  status: string
  timestamp: string
}

interface QuickActivityChartProps {
  transactions: Transaction[]
  userId: number
}

export function QuickActivityChart({ transactions, userId }: QuickActivityChartProps) {
  // Aggregate daily totals
  const dailyActivity = transactions.reduce(
    (acc, tx) => {
      const date = format(new Date(tx.timestamp), "MMM dd") // Format date for chart
      if (!acc[date]) {
        acc[date] = { date, sent: 0, received: 0 }
      }
      if (tx.senderId === userId && tx.status === "COMPLETED") {
        acc[date].sent += tx.amount
      } else if (tx.recipientId === userId && tx.status === "COMPLETED") {
        acc[date].received += tx.amount
      }
      return acc
    },
    {} as Record<string, { date: string; sent: number; received: number }>,
  )

  // Convert to array and sort by date
  const chartData = Object.values(dailyActivity).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate total sent and received for display
  const totalSent = chartData.reduce((sum, day) => sum + day.sent, 0)
  const totalReceived = chartData.reduce((sum, day) => sum + day.received, 0)

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1, // Adjust as needed for precision
    }).format(value)
  }

  const chartConfig = {
    sent: {
      label: "Sent",
      color: "hsl(var(--destructive))", // Using destructive for sent (red)
    },
    received: {
      label: "Received",
      color: "hsl(var(--paypal-accent))", // Using paypal-accent for received (blue)
    },
  } as const

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-1 bg-card shadow-lg border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-muted-foreground">Quick Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Sent</p>
            <p className="text-2xl font-bold text-destructive break-all">
              {" "}
              {/* Added break-all */}
              {formatCurrencyCompact(totalSent)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-paypal-accent break-all">
              {" "}
              {/* Added break-all */}
              {formatCurrencyCompact(totalReceived)}
            </p>
          </div>
        </div>
        {chartData.length > 0 ? (
          (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.split(",")[0]}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrencyCompact(value)} 
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sent" fill="var(--color-sent)" radius={4} />
              <Bar dataKey="received" fill="var(--color-received)" radius={4} />
            </BarChart>
          </ChartContainer>
          )
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">No completed transactions for chart.</p>
        )}
      </CardContent>
    </Card>
  )
}
