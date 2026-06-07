export default function EventsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
          <div className="space-y-2">
            <div className="h-5 w-24 animate-pulse rounded bg-sb-cream-dark" />
            <div className="h-3 w-40 animate-pulse rounded bg-sb-cream-dark" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-5"
          >
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-sb-cream-dark" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-sb-cream-dark" />
                </div>
                <div className="h-5 w-3/4 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-sb-cream-dark" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
