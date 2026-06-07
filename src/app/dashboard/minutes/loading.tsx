export default function MinutesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
          <div className="space-y-2">
            <div className="h-5 w-36 animate-pulse rounded bg-sb-cream-dark" />
            <div className="h-3 w-44 animate-pulse rounded bg-sb-cream-dark" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-5"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-28 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-full animate-pulse rounded bg-sb-cream-dark" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
