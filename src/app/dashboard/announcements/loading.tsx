export default function AnnouncementsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
          <div className="space-y-2">
            <div className="h-5 w-36 animate-pulse rounded bg-sb-cream-dark" />
            <div className="h-3 w-52 animate-pulse rounded bg-sb-cream-dark" />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-5"
          >
            <div className="space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-sb-cream-dark" />
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-sb-cream-dark" />
              </div>
              <div className="flex gap-2">
                <div className="h-3 w-24 animate-pulse rounded bg-sb-cream-dark" />
                <div className="h-3 w-20 animate-pulse rounded bg-sb-cream-dark" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
