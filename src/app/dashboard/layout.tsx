import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { PaymentWall } from "@/components/payment-wall";
import { AgreementWall } from "@/components/agreement-wall";
import { MembershipJourney } from "@/components/membership-journey";
import { Toaster } from "@/components/ui/sonner";
import { ShieldAlert } from "lucide-react";

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

  // Load member profile with payment and agreement fields
  const { data: member } = await supabase
    .from("members")
    .select(
      "full_name, role, photo_url, membership_status, good_standing, commitment_fee_paid, commitment_fee_pending, signed_agreement_at"
    )
    .eq("id", user.id)
    .single();

  // Determine if the agreement wall should show
  // Show agreement wall if: member is approved but has NOT signed the agreement
  // Admin is always exempt (needs full access to manage the app)
  const isAdmin = member?.role === "admin";
  const isApproved = member?.membership_status === "active" || member?.membership_status === "restricted";
  const isSuspended = !isAdmin && member?.membership_status === "suspended";
  const needsAgreement = !isAdmin && isApproved && !member?.signed_agreement_at;

  // Determine if the payment wall should show (only after agreement is signed)
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
      {/* Suspended - blocks everything, takes priority over every other gate */}
      {isSuspended && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <ShieldAlert className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 font-heading text-xl font-bold text-red-600">
              Account Suspended
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your membership has been suspended. Please contact an
              association admin to resolve this before regaining access.
            </p>
          </div>
        </div>
      )}

      {/* Agreement Wall - blocks everything until member signs the constitution */}
      {!isSuspended && needsAgreement && (
        <AgreementWall
          memberId={user.id}
          memberName={member?.full_name || "Member"}
        />
      )}

      {/* Payment Wall - blocks everything if member has unpaid obligations */}
      {!isSuspended && !needsAgreement && showPaymentWall && (
        <PaymentWall
          memberId={user.id}
          memberName={member?.full_name || "Member"}
          commitmentFeePaid={member?.commitment_fee_paid ?? false}
          commitmentFeePending={member?.commitment_fee_pending ?? false}
        />
      )}

      {!isSuspended && !needsAgreement && !showPaymentWall && (
        <>
          <DashboardSidebar
            memberName={member?.full_name || "Member"}
            memberRole={member?.role || "member"}
            memberPhoto={member?.photo_url}
            memberStatus={member?.membership_status || "pending"}
          />
          <main className="flex-1 overflow-y-auto bg-sb-cream p-4 pb-20 sm:p-6 md:pb-6 lg:p-8">
            {member?.membership_status === "pending" && (
              <div className="mb-6 rounded-xl border border-sb-gold/30 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-sb-green-dark">
                  Your Membership Journey
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your application has been received. Leadership will review
                  it shortly. You will be notified when approved.
                </p>
                <div className="mt-4">
                  <MembershipJourney currentStep={2} />
                </div>
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
