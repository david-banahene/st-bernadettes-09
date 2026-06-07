import { createBrowserClient } from "@supabase/ssr";

// Creates a Supabase client for use in the browser (client components).
// This client runs in the user's browser and respects Row Level Security.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
