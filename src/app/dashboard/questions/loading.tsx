export default function QuestionsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-sb-cream-dark" />
          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded bg-sb-cream-dark" />
            <div className="h-3 w-48 animate-pulse rounded bg-sb-cream-dark" />
          </div>
        </div>
        <div className="h-9 w-32 animate-pulse rounded-md bg-sb-cream-dark" />
      </div>

      <div className="mt-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-sb-cream-dark bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-sb-cream-dark" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-sb-cream-dark" />
                </div>
                <div className="h-3 w-32 animate-pulse rounded bg-sb-cream-dark" />
              </div>
              <div className="h-4 w-4 animate-pulse rounded bg-sb-cream-dark" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
