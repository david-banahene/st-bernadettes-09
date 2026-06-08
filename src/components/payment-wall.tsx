"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  CalendarCheck,
} from "lucide-react";

interface Props {
  memberId: string;
  memberName: string;
  commitmentFeePaid: boolean;
  commitmentFeePending: boolean;
}

interface DuesRecord {
  id: string;
  month: string;
  amount: number;
  status: string;
}

interface MomoSettings {
  name: string;
  number: string;
  network: string;
}

function formatCollectionMonth(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function PaymentWall({
  memberId,
  memberName,
  commitmentFeePaid,
  commitmentFeePending: initialPending,
}: Props) {
  const [momoSettings, setMomoSettings] = useState<MomoSettings | null>(null);
  const [unpaidDues, setUnpaidDues] = useState<DuesRecord[]>([]);
  const [commitmentPending, setCommitmentPending] = useState(initialPending);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [activeCollectionMonth, setActiveCollectionMonth] = useState("");

  const firstName = memberName.split(" ")[0];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();

    // Get MoMo collection settings and active collection month
    const { data: settings } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["momo_name", "momo_number", "momo_network", "active_collection_month"]);

    if (settings && settings.length > 0) {
      const settingsMap = Object.fromEntries(
        settings.map((s) => [s.key, s.value])
      );
      setMomoSettings({
        name: settingsMap.momo_name || "Not Set",
        number: settingsMap.momo_number || "0000000000",
        network: settingsMap.momo_network || "MTN MoMo",
      });
      if (settingsMap.active_collection_month) {
        setActiveCollectionMonth(settingsMap.active_collection_month);
      }
    }

    // Get unpaid dues for this member
    const { data: dues } = await supabase
      .from("monthly_dues")
      .select("id, month, amount, status")
      .eq("member_id", memberId)
      .in("status", ["pending", "member_claimed"])
      .order("month", { ascending: true });

    setUnpaidDues(dues || []);
    setLoading(false);
  }

  async function claimCommitmentFee() {
    setSubmitting("commitment");
    const supabase = createClient();

    await supabase
      .from("members")
      .update({ commitment_fee_pending: true })
      .eq("id", memberId);

    setCommitmentPending(true);
    toast.success("Payment claim submitted. Admin will confirm.");
    setSubmitting(null);
  }

  async function claimDuesPaid(duesId: string) {
    setSubmitting(duesId);
    const supabase = createClient();

    await supabase
      .from("monthly_dues")
      .update({ status: "member_claimed" })
      .eq("id", duesId);

    toast.success("Payment claim submitted. Admin will confirm.");
    await loadData();
    setSubmitting(null);
  }

  // Calculate total owed
  const commitmentOwed = commitmentFeePaid ? 0 : 100;
  const duesOwed = unpaidDues
    .filter((d) => d.status === "pending")
    .reduce((sum, d) => sum + d.amount, 0);
  const totalOwed = commitmentOwed + duesOwed;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-sb-cream">
        <Loader2 className="h-8 w-8 animate-spin text-sb-green" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sb-cream">
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sb-gold/10">
            <ShieldAlert className="h-8 w-8 text-sb-gold-dark" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-sb-green-dark">
            Welcome, {firstName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            To activate your full membership, please clear the following
            payments. Once confirmed by admin, you will have full access.
          </p>
          {activeCollectionMonth && (
            <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-sb-green-dark/5 px-4 py-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-sb-green" />
              <span className="text-xs font-medium text-sb-green-dark">
                Currently collecting: {formatCollectionMonth(activeCollectionMonth)}
              </span>
            </div>
          )}
        </div>

        {/* Total Owed */}
        {totalOwed > 0 && (
          <div className="mt-6 rounded-xl bg-sb-green-dark p-4 text-center text-white">
            <p className="text-xs uppercase tracking-wider text-sb-cream/70">
              Total Outstanding
            </p>
            <p className="mt-1 text-3xl font-bold">GHS {totalOwed}</p>
          </div>
        )}

        {/* MoMo Details */}
        {momoSettings && momoSettings.name !== "Not Set" && (
          <Card className="mt-6 border-sb-gold/30 bg-white">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                Send Mobile Money to
              </div>
              <div className="mt-3 rounded-lg bg-sb-cream p-4">
                <p className="text-lg font-bold text-sb-green-dark">
                  {momoSettings.name}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-wide text-sb-green-dark">
                  {momoSettings.number}
                </p>
                <Badge className="mt-2 bg-sb-gold/10 text-xs text-sb-gold-dark">
                  {momoSettings.network}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {momoSettings && momoSettings.name === "Not Set" && (
          <Card className="mt-6 border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-3 pt-5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                Payment details not yet configured. Please contact admin.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Payment Items */}
        <div className="mt-6 space-y-3">
          {/* Commitment Fee */}
          {!commitmentFeePaid && (
            <Card className="border-sb-cream-dark bg-white">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-sb-green-dark">
                      Commitment Fee
                    </p>
                    <p className="text-xs text-muted-foreground">
                      One-time membership activation
                    </p>
                  </div>
                  <p className="text-lg font-bold text-sb-green-dark">
                    GHS 100
                  </p>
                </div>
                <div className="mt-3">
                  {commitmentPending ? (
                    <div className="flex items-center gap-2 rounded-lg bg-sb-gold/5 p-3">
                      <Clock className="h-4 w-4 text-sb-gold-dark" />
                      <p className="text-sm text-sb-gold-dark">
                        Awaiting admin confirmation
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={claimCommitmentFee}
                      disabled={submitting === "commitment"}
                      className="w-full bg-sb-green text-white hover:bg-sb-green-light"
                    >
                      {submitting === "commitment" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      I Have Paid GHS 100
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Dues */}
          {unpaidDues.map((dues) => {
            const monthLabel = new Date(dues.month).toLocaleDateString(
              "en-GB",
              { month: "long", year: "numeric" }
            );
            const isClaimed = dues.status === "member_claimed";

            return (
              <Card key={dues.id} className="border-sb-cream-dark bg-white">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-sb-green-dark">
                        Monthly Dues
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {monthLabel}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-sb-green-dark">
                      GHS {dues.amount}
                    </p>
                  </div>
                  <div className="mt-3">
                    {isClaimed ? (
                      <div className="flex items-center gap-2 rounded-lg bg-sb-gold/5 p-3">
                        <Clock className="h-4 w-4 text-sb-gold-dark" />
                        <p className="text-sm text-sb-gold-dark">
                          Awaiting admin confirmation
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => claimDuesPaid(dues.id)}
                        disabled={submitting === dues.id}
                        className="w-full bg-sb-green text-white hover:bg-sb-green-light"
                      >
                        {submitting === dues.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        I Have Paid GHS {dues.amount}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* All claimed - waiting state */}
          {commitmentFeePaid && unpaidDues.length === 0 && (
            <div className="rounded-xl bg-sb-green/5 p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-sb-green" />
              <p className="mt-2 text-sm font-semibold text-sb-green">
                All payments confirmed
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Refreshing your access...
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          After sending payment via MoMo, tap &quot;I Have Paid&quot; above.
          Admin will confirm within 24 hours. If you have questions, use
          WhatsApp to reach the leadership.
        </p>
      </div>
    </div>
  );
}
