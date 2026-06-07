export default function AdminLoading() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-sb-cream-dark" />
          <div className="h-3 w-40 animate-pulse rounded bg-sb-cream-dark" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-5 w-10 animate-pulse rounded bg-sb-cream-dark" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-pulse rounded bg-sb-cream-dark" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-36 animate-pulse rounded bg-sb-cream-dark" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
