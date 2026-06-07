import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-sb-cream-dark" />
          <div className="h-3 w-56 animate-pulse rounded bg-sb-cream-dark" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-5 w-12 animate-pulse rounded bg-sb-cream-dark" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-sb-cream-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-sb-cream-dark" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
