import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";

export default function BillingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <Skeleton className="h-36 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Skeleton className="h-36 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
