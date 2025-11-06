import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function SettingsSkeleton() {
  return (
    <div className="px-4 md:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-1/4" />
        </div>
      </div>
    </div>
  );
}
