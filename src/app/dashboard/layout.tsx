import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { PaymentWall } from "@/components/payment-wall";
import { Toaster } from "@/components/ui/sonner";

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

  // Load member profile with payment fields
  const { data: member } = await supabase
    .from("members")
    .select(
      "full_name, role, photo_url, membership_status, good_standing, commitment_fee_paid, commitment_fee_pending"
    )
    .eq("id", user.id)
    .single();

  // Determine if the payment wall should show
  // Show wall if: member is active but has NOT paid commitment fee
  // Admin is always exempt (needs full access to manage the app)
  const isAdmin = member?.role === "admin";
  const isApproved = member?.membership_status === "active" || member?.membership_status === "restricted";
  const needsPaymentWall =
    !isAdmin &&
    isApproved &&
    !member?.commitment_fee_paid;

  // Check for overdue dues with smarter grace periods:
  // - Past-month dues (month < current month): 3-day grace from creation
  // - Current-month dues: 14-day grace from creation
  let hasOverdueDues = false;
  if (!isAdmin && isApproved && member?.commitment_fee_paid) {
    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    // Fetch all pending dues for this member (not claimed or paid)
    const { data: pendingDues } = await supabase
      .from("monthly_dues")
      .select("month, created_at")
      .eq("member_id", user.id)
      .eq("status", "pending");

    if (pendingDues && pendingDues.length > 0) {
      for (const d of pendingDues) {
        const createdAt = new Date(d.created_at);
        // Past-month dues get 3-day grace, current/future get 14
        const isPastMonth = d.month < currentMonthStart;
        const graceDays = isPastMonth ? 3 : 14;
        const graceDeadline = new Date(createdAt);
        graceDeadline.setDate(graceDeadline.getDate() + graceDays);

        if (now > graceDeadline) {
          hasOverdueDues = true;
          break;
        }
      }
    }
  }

  const showPaymentWall = needsPaymentWall || hasOverdueDues;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Payment Wall - blocks everything if member has unpaid obligations */}
      {showPaymentWall && (
        <PaymentWall
          memberId={user.id}
          memberName={member?.full_name || "Member"}
          commitmentFeePaid={member?.commitment_fee_paid ?? false}
          commitmentFeePending={member?.commitment_fee_pending ?? false}
        />
      )}

      {!showPaymentWall && (
        <>
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
                  Your membership is pending approval. Some features may be
                  limited until a leader approves your application.
                </p>
              </div>
            )}
            {children}
          </main>
        </>
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
