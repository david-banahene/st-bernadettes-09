"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  CheckCircle2,
  Clock,
  Smartphone,
  AlertCircle,
} from "lucide-react";

interface Props {
  eventId: string;
  amount: number;
  userId: string;
  isLeaderOrAdmin: boolean;
}

interface PaymentRecord {
  id: string;
  member_id: string;
  status: string;
  payment_method: string;
  created_at: string;
  paid_at: string | null;
  member?: {
    full_name: string;
    phone_number: string;
    photo_url: string | null;
  };
}

export function EventPaymentSection({
  eventId,
  amount,
  userId,
  isLeaderOrAdmin,
}: Props) {
  const [myPayment, setMyPayment] = useState<PaymentRecord | null>(null);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [adminMomo, setAdminMomo] = useState<{
    name: string;
    number: string;
    network: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();

    // Get my payment status
    const { data: myPay } = await supabase
      .from("event_payments")
      .select("*")
      .eq("event_id", eventId)
      .eq("member_id", userId)
      .maybeSingle();

    setMyPayment(myPay);

    // Get admin's MoMo details (from the admin member record)
    const { data: admin } = await supabase
      .from("members")
      .select("full_name, phone_number")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (admin) {
      setAdminMomo({
        name: admin.full_name,
        number: admin.phone_number,
        network: "MTN MoMo",
      });
    }

    // If leader/admin, load all payments for this event
    if (isLeaderOrAdmin) {
      const { data: payments } = await supabase
        .from("event_payments")
        .select("*, member:members(full_name, phone_number, photo_url)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      setAllPayments(payments || []);
    }

    setLoading(false);
  }

  async function markAsPaid() {
    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from("event_payments").insert({
      event_id: eventId,
      member_id: userId,
      amount,
      payment_method: "mtn_momo",
      status: "pending",
    });

    if (!error) {
      await loadData();
    }
    setSubmitting(false);
  }

  async function confirmPayment(paymentId: string) {
    setConfirming(paymentId);
    const supabase = createClient();

    // Find this payment to get the member_id
    const payment = allPayments.find((p) => p.id === paymentId);

    const { error } = await supabase
      .from("event_payments")
      .update({
        status: "success",
        paid_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (!error) {
      // Send email notification to the member
      if (payment) {
        try {
          await fetch("/api/email/payment-confirmed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              memberId: payment.member_id,
              paymentType: "Event Payment",
              amount: String(amount),
            }),
          });
        } catch {
          // Email failure should not block confirmation
        }
      }
      await loadData();
    }
    setConfirming(null);
  }

  if (loading) {
    return (
      <Card className="border-sb-cream-dark bg-white">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
        </CardContent>
      </Card>
    );
  }

  const pendingCount = allPayments.filter((p) => p.status === "pending").length;
  const confirmedCount = allPayments.filter(
    (p) => p.status === "success"
  ).length;

  return (
    <div className="space-y-4">
      {/* Member Payment Card */}
      <Card className="border-sb-cream-dark bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-sb-green-dark">
            <Smartphone className="h-4 w-4 text-sb-gold" />
            Payment - GHS {amount}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myPayment?.status === "success" ? (
            <div className="flex items-center gap-3 rounded-lg bg-sb-green/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-sb-green" />
              <div>
                <p className="text-sm font-semibold text-sb-green">
                  Payment Confirmed
                </p>
                <p className="text-xs text-muted-foreground">
                  Confirmed on{" "}
                  {new Date(myPayment.paid_at!).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ) : myPayment?.status === "pending" ? (
            <div className="flex items-center gap-3 rounded-lg bg-sb-gold/5 p-4">
              <Clock className="h-5 w-5 text-sb-gold-dark" />
              <div>
                <p className="text-sm font-semibold text-sb-gold-dark">
                  Awaiting Confirmation
                </p>
                <p className="text-xs text-muted-foreground">
                  You marked this as paid. The admin will confirm once they
                  receive it.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {adminMomo && (
                <div className="rounded-lg bg-sb-cream p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Send MoMo to
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-sb-green-dark">
                      {adminMomo.name}
                    </p>
                    <p className="text-lg font-bold text-sb-green-dark">
                      {adminMomo.number}
                    </p>
                    <Badge className="bg-sb-gold/10 text-[10px] text-sb-gold-dark">
                      {adminMomo.network}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Amount: GHS {amount}
                  </p>
                </div>
              )}
              <Button
                onClick={markAsPaid}
                disabled={submitting}
                className="w-full bg-sb-green text-white hover:bg-sb-green-light"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />I Have Paid
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Click after you have sent the MoMo payment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Payment Management */}
      {isLeaderOrAdmin && allPayments.length > 0 && (
        <Card className="border-sb-cream-dark bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-sb-green-dark">
              <span>Payment Tracker</span>
              <div className="flex gap-2">
                <Badge className="bg-sb-green/10 text-[10px] text-sb-green">
                  {confirmedCount} confirmed
                </Badge>
                {pendingCount > 0 && (
                  <Badge className="bg-sb-gold/10 text-[10px] text-sb-gold-dark">
                    {pendingCount} pending
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allPayments.map((payment) => {
                const member = payment.member as PaymentRecord["member"];
                const initials = member?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "??";

                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 rounded-lg border border-sb-cream-dark p-3"
                  >
                    <Avatar className="h-8 w-8 border border-sb-cream-dark">
                      {member?.photo_url && (
                        <AvatarImage
                          src={member.photo_url}
                          alt={member.full_name}
                        />
                      )}
                      <AvatarFallback className="bg-sb-green text-[10px] font-semibold text-sb-gold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-sb-green-dark">
                        {member?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member?.phone_number}
                      </p>
                    </div>
                    {payment.status === "success" ? (
                      <Badge className="bg-sb-green/10 text-[10px] text-sb-green">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Confirmed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => confirmPayment(payment.id)}
                        disabled={confirming === payment.id}
                        className="bg-sb-gold text-white hover:bg-sb-gold-dark"
                      >
                        {confirming === payment.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Confirm Received"
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
