export default function MembersLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded bg-sb-cream-dark" />
            <div className="h-3 w-44 animate-pulse rounded bg-sb-cream-dark" />
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="mt-6 h-10 w-full animate-pulse rounded-md bg-sb-cream-dark" />

      {/* Member cards skeleton */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-sb-cream-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-sb-cream-dark" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded-full bg-sb-cream-dark" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
