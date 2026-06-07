export default function ProfileLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-sb-cream-dark" />
          <div className="h-3 w-56 animate-pulse rounded bg-sb-cream-dark" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-md bg-sb-cream-dark" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Photo card */}
        <div className="rounded-xl border border-sb-cream-dark bg-white p-6">
          <div className="flex flex-col items-center">
            <div className="h-28 w-28 animate-pulse rounded-full bg-sb-cream-dark" />
            <div className="mt-4 h-5 w-36 animate-pulse rounded bg-sb-cream-dark" />
            <div className="mt-2 flex gap-2">
              <div className="h-5 w-14 animate-pulse rounded-full bg-sb-cream-dark" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-sb-cream-dark" />
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="space-y-4 lg:col-span-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-sb-cream-dark bg-white p-6"
            >
              <div className="h-4 w-36 animate-pulse rounded bg-sb-cream-dark" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-sb-cream-dark" />
                    <div className="h-4 w-full animate-pulse rounded bg-sb-cream-dark" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
