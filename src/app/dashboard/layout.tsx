import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

// This layout wraps all /dashboard pages. It checks if the user is
// authenticated and loads their member profile for the sidebar.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load member profile
  const { data: member } = await supabase
    .from("members")
    .select("full_name, role, photo_url, membership_status")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar
        memberName={member?.full_name || "Member"}
        memberRole={member?.role || "member"}
        memberPhoto={member?.photo_url}
        memberStatus={member?.membership_status || "pending"}
      />
      <main className="flex-1 overflow-y-auto bg-sb-cream p-4 pb-20 sm:p-6 md:pb-6 lg:p-8">
        {member?.membership_status === "pending" && (
          <div className="mb-6 rounded-lg border border-sb-gold/30 bg-sb-gold/5 p-4">
            <p className="text-sm text-sb-gold-dark">
              Your membership is pending approval. Some features may be limited
              until a leader approves your application.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
