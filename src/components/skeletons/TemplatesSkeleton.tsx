import React from "react";
import { Skeleton } from "../ui/skeleton";

export default function TemplatesSkeleton() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center">
              <Skeleton className="h-40 w-full rounded-md" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
