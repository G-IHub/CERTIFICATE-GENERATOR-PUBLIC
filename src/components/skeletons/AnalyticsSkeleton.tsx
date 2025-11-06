import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <Skeleton className="h-80 w-full rounded-md" />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Skeleton className="h-80 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
