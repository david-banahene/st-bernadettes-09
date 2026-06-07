"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  Loader2,
  Shield,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
} from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  photo_url: string | null;
  phone_number: string;
  good_standing: boolean;
  commitment_fee_paid: boolean;
}

interface DuesRecord {
  id: string;
  member_id: string;
  month: string;
  amount: number;
  status: string;
  paid_at: string | null;
}

export default function DuesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [dues, setDues] = useState<DuesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: me } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    if (me?.role !== "admin") {
      setLoading(false);
      return;
    }
    setAuthorized(true);

    const { data: allMembers } = await supabase
      .from("members")
      .select("id, full_name, photo_url, phone_number, good_standing, commitment_fee_paid")
      .eq("membership_status", "active")
      .order("full_name");

    setMembers(allMembers || []);

    const monthStart = `${selectedMonth}-01`;
    const { data: monthDues } = await supabase
      .from("monthly_dues")
      .select("*")
      .eq("month", monthStart);

    setDues(monthDues || []);
    setLoading(false);
  }

  async function generateDues() {
    setGenerating(true);
    const supabase = createClient();
    const monthStart = `${selectedMonth}-01`;

    const existingMemberIds = dues.map((d) => d.member_id);
    const newDues = members
      .filter((m) => !existingMemberIds.includes(m.id))
      .map((m) => ({
        member_id: m.id,
        month: monthStart,
        amount: 20.0,
        status: "pending",
      }));

    if (newDues.length > 0) {
      await supabase.from("monthly_dues").insert(newDues);
    }

    setGenerating(false);
    await loadData();
  }

  async function confirmPayment(duesId: string) {
    setConfirming(duesId);
    const supabase = createClient();

    // Find which member this dues record belongs to
    const duesRecord = dues.find((d) => d.id === duesId);

    await supabase
      .from("monthly_dues")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", duesId);

    // Send email notification to the member
    if (duesRecord) {
      try {
        await fetch("/api/email/dues-confirmed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: duesRecord.member_id,
            month: `${selectedMonth}-01`,
          }),
        });
      } catch {
        // Email failure should not block confirmation
      }
    }

    setConfirming(null);
    await loadData();
  }

  async function recalculateStanding() {
    const supabase = createClient();

    for (const member of members) {
      const { count: paidMonths } = await supabase
        .from("monthly_dues")
        .select("*", { count: "exact", head: true })
        .eq("member_id", member.id)
        .eq("status", "paid");

      const { count: totalMonths } = await supabase
        .from("monthly_dues")
        .select("*", { count: "exact", head: true })
        .eq("member_id", member.id);

      const allDuesPaid = totalMonths !== null && totalMonths > 0 && paidMonths === totalMonths;
      const goodStanding = member.commitment_fee_paid && allDuesPaid;

      await supabase
        .from("members")
        .update({ good_standing: goodStanding })
        .eq("id", member.id);
    }

    await loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="py-20 text-center">
        <Shield className="mx-auto h-8 w-8 text-sb-cream-dark" />
        <p className="mt-2 text-sm text-muted-foreground">Admin access only.</p>
      </div>
    );
  }

  const paidCount = dues.filter((d) => d.status === "paid").length;
  const pendingCount = dues.filter((d) => d.status === "pending").length;
  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/10 text-sb-gold-dark">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
              Dues Tracking
            </h1>
            <p className="text-sm text-muted-foreground">
              Monthly dues GHS 20 per member
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={recalculateStanding}
          className="border-sb-cream-dark text-sb-green-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Standing
        </Button>
      </div>

      {/* Month Selector */}
      <div className="mt-6 flex items-center gap-4">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <span className="text-sm font-medium text-sb-green-dark">
          {monthLabel}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-bold text-sb-green-dark">
                {paidCount}/{members.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-gold/8 text-sb-gold-dark">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-sb-green-dark">
                {pendingCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-lg font-bold text-sb-green-dark">
                GHS {paidCount * 20}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Dues Button */}
      {dues.length === 0 && (
        <div className="mt-6">
          <Button
            onClick={generateDues}
            disabled={generating}
            className="bg-sb-green text-white hover:bg-sb-green-light"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Generate Dues for {monthLabel}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">
            Creates a GHS 20 dues record for each active member.
          </p>
        </div>
      )}

      {/* Members Dues List */}
      {dues.length > 0 && (
        <div className="mt-6 space-y-2">
          {members.map((m) => {
            const memberDues = dues.find((d) => d.member_id === m.id);
            if (!memberDues) return null;

            const initials = m.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const isPaid = memberDues.status === "paid";

            return (
              <Card key={m.id} className="border-sb-cream-dark bg-white">
                <CardContent className="flex items-center gap-4 py-3">
                  <Avatar className="h-8 w-8 border border-sb-cream-dark">
                    {m.photo_url && (
                      <AvatarImage src={m.photo_url} alt={m.full_name} />
                    )}
                    <AvatarFallback className="bg-sb-green text-[10px] font-semibold text-sb-gold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sb-green-dark">
                      {m.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.phone_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-sb-green-dark">
                      GHS {memberDues.amount}
                    </p>
                  </div>
                  {isPaid ? (
                    <Badge className="bg-sb-green/10 text-[10px] text-sb-green">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Paid
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => confirmPayment(memberDues.id)}
                      disabled={confirming === memberDues.id}
                      className="bg-sb-gold text-white hover:bg-sb-gold-dark"
                    >
                      {confirming === memberDues.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Confirm Paid"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
