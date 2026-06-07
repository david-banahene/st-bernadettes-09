"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sb-cream px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sb-green/10">
        <svg
          className="h-8 w-8 text-sb-green"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M8.464 15.536a5 5 0 010-7.072M15.536 8.464a5 5 0 010 7.072"
          />
          <line x1="4" y1="4" x2="20" y2="20" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="mt-6 font-heading text-2xl font-bold text-sb-green-dark">
        You are offline
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Check your internet connection and try again. The app will reload
        automatically when you are back online.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg bg-sb-green px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sb-green-light"
      >
        Try Again
      </button>
    </div>
  );
}
