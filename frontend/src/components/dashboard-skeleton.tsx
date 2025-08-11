import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Wallet Card Skeleton */}
      <Card className="col-span-full md:col-span-2 lg:col-span-3 bg-card shadow-lg border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-muted-foreground">
            Current Balance
          </CardTitle>
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </CardContent>
      </Card>
      {/* Quick Actions Skeleton */}
      <Card className="col-span-full md:col-span-2 lg:col-span-1 bg-card shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-muted-foreground">
            Quick Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
      {/* Transactions Section Skeleton */}
      <Card className="col-span-full bg-card shadow-lg border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-muted-foreground">
            Transaction History
          </CardTitle>
          <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
