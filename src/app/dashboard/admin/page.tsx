"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  CalendarDays,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Clock,
  Smartphone,
  Save,
  FileCheck,
} from "lucide-react";

interface Stats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  goodStandingCount: number;
  signedAgreementCount: number;
  upcomingEvents: number;
  pendingQuestions: number;
  pendingWelfare: number;
}

interface PendingMember {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  town_or_city: string;
  photo_url: string | null;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [momoName, setMomoName] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoNetwork, setMomoNetwork] = useState("MTN MoMo");
  const [savingMomo, setSavingMomo] = useState(false);
  const [pendingCommitments, setPendingCommitments] = useState<PendingMember[]>([]);
  const [confirmingFee, setConfirmingFee] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    if (member?.role !== "admin") {
      setLoading(false);
      return;
    }
    setAuthorized(true);

    const { count: totalMembers } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    const { count: activeMembers } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("membership_status", "active");

    const { count: pendingCount } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("membership_status", "pending");

    const { count: goodStandingCount } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("good_standing", true);

    const { count: signedAgreementCount } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .not("signed_agreement_at", "is", null);

    const { count: upcomingEvents } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gt("event_date", new Date().toISOString());

    const { count: pendingQuestions } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: pendingWelfare } = await supabase
      .from("welfare_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setStats({
      totalMembers: totalMembers ?? 0,
      activeMembers: activeMembers ?? 0,
      pendingMembers: pendingCount ?? 0,
      goodStandingCount: goodStandingCount ?? 0,
      signedAgreementCount: signedAgreementCount ?? 0,
      upcomingEvents: upcomingEvents ?? 0,
      pendingQuestions: pendingQuestions ?? 0,
      pendingWelfare: pendingWelfare ?? 0,
    });

    const { data: pending } = await supabase
      .from("members")
      .select("id, full_name, email, phone_number, town_or_city, photo_url, created_at")
      .eq("membership_status", "pending")
      .order("created_at", { ascending: true });

    setPendingMembers(pending || []);

    // Load MoMo collection settings
    const { data: settings } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["momo_name", "momo_number", "momo_network"]);

    if (settings) {
      const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
      setMomoName(map.momo_name || "");
      setMomoNumber(map.momo_number || "");
      setMomoNetwork(map.momo_network || "MTN MoMo");
    }

    // Load members who claimed commitment fee payment (pending confirmation)
    const { data: commitmentPending } = await supabase
      .from("members")
      .select("id, full_name, email, phone_number, town_or_city, photo_url, created_at")
      .eq("commitment_fee_pending", true)
      .eq("commitment_fee_paid", false)
      .order("created_at", { ascending: true });

    setPendingCommitments(commitmentPending || []);

    setLoading(false);
  }

  async function approveMember(memberId: string) {
    setApproving(memberId);
    const supabase = createClient();
    await supabase
      .from("members")
      .update({ membership_status: "active" })
      .eq("id", memberId);

    // Send welcome email to the approved member
    try {
      await fetch("/api/email/member-approved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
    } catch {
      // Email failure should not block approval
    }

    toast.success("Member approved");
    await loadData();
    setApproving(null);
  }

  async function saveMomoSettings() {
    setSavingMomo(true);
    const supabase = createClient();

    const updates = [
      { key: "momo_name", value: momoName },
      { key: "momo_number", value: momoNumber },
      { key: "momo_network", value: momoNetwork },
    ];

    for (const u of updates) {
      await supabase
        .from("app_settings")
        .upsert({ key: u.key, value: u.value, updated_at: new Date().toISOString() });
    }

    toast.success("MoMo details updated");
    setSavingMomo(false);
  }

  async function confirmCommitmentFee(memberId: string) {
    setConfirmingFee(memberId);
    const supabase = createClient();

    await supabase
      .from("members")
      .update({
        commitment_fee_paid: true,
        commitment_fee_pending: false,
      })
      .eq("id", memberId);

    // Recalculate standing for this member
    const { count: totalDues } = await supabase
      .from("monthly_dues")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId);

    const { count: paidDues } = await supabase
      .from("monthly_dues")
      .select("*", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("status", "paid");

    const allDuesPaid = totalDues !== null && totalDues > 0 ? paidDues === totalDues : true;

    await supabase
      .from("members")
      .update({ good_standing: allDuesPaid })
      .eq("id", memberId);

    toast.success("Commitment fee confirmed");
    await loadData();
    setConfirmingFee(null);
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
        <p className="mt-2 text-sm text-muted-foreground">
          Admin access only.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/10 text-sb-gold-dark">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the association
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Members</p>
              <p className="text-xl font-bold text-sb-green-dark">
                {stats?.totalMembers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-xl font-bold text-sb-green-dark">
                {stats?.activeMembers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/8 text-sb-gold-dark">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className="text-xl font-bold text-sb-green-dark">
                {stats?.pendingMembers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Good Standing</p>
              <p className="text-xl font-bold text-sb-green-dark">
                {stats?.goodStandingCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/8 text-green-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agreement Signed</p>
              <p className="text-xl font-bold text-sb-green-dark">
                {stats?.signedAgreementCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  of {stats?.totalMembers}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/admin/members">
          <Card className="cursor-pointer border-sb-cream-dark bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-sb-green" />
                <div>
                  <p className="text-sm font-semibold text-sb-green-dark">
                    Manage Members
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Roles, status, approvals
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/dues">
          <Card className="cursor-pointer border-sb-cream-dark bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-sb-gold-dark" />
                <div>
                  <p className="text-sm font-semibold text-sb-green-dark">
                    Dues & Payments
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Monthly dues, commitment fees
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/events">
          <Card className="cursor-pointer border-sb-cream-dark bg-white transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-sb-green" />
                <div>
                  <p className="text-sm font-semibold text-sb-green-dark">
                    Create Event
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.upcomingEvents} upcoming
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* MoMo Collection Settings */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-sb-green-dark">
          MoMo Collection Details
        </h2>
        <p className="text-xs text-muted-foreground">
          This is shown to all members when they need to make payments.
        </p>
        <Card className="mt-3 border-sb-cream-dark bg-white">
          <CardContent className="pt-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Recipient Name
                </label>
                <Input
                  value={momoName}
                  onChange={(e) => setMomoName(e.target.value)}
                  placeholder="e.g. Kwame Asante"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  MoMo Number
                </label>
                <Input
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="e.g. 0241234567"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Network
                </label>
                <select
                  value={momoNetwork}
                  onChange={(e) => setMomoNetwork(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>MTN MoMo</option>
                  <option>Vodafone Cash</option>
                  <option>AirtelTigo Money</option>
                </select>
              </div>
            </div>
            <Button
              onClick={saveMomoSettings}
              disabled={savingMomo || !momoName.trim() || !momoNumber.trim()}
              className="mt-3 bg-sb-green text-white hover:bg-sb-green-light"
              size="sm"
            >
              {savingMomo ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Commitment Fee Confirmations */}
      {pendingCommitments.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-sb-green-dark">
            Pending Commitment Fee Payments
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({pendingCommitments.length})
            </span>
          </h2>
          <div className="mt-4 space-y-3">
            {pendingCommitments.map((m) => {
              const initials = m.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card key={m.id} className="border-sb-gold/30 bg-white">
                  <CardContent className="flex items-center gap-4 py-4">
                    <Avatar className="h-10 w-10 border border-sb-cream-dark">
                      {m.photo_url && (
                        <AvatarImage src={m.photo_url} alt={m.full_name} />
                      )}
                      <AvatarFallback className="bg-sb-green text-xs font-semibold text-sb-gold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-sb-green-dark">
                        {m.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Claims to have paid GHS 100 commitment fee
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.phone_number}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => confirmCommitmentFee(m.id)}
                      disabled={confirmingFee === m.id}
                      className="bg-sb-gold text-white hover:bg-sb-gold-dark"
                    >
                      {confirmingFee === m.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Confirm Paid
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-sb-green-dark">
          Pending Approvals
          {pendingMembers.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({pendingMembers.length})
            </span>
          )}
        </h2>

        {pendingMembers.length > 0 ? (
          <div className="mt-4 space-y-3">
            {pendingMembers.map((m) => {
              const initials = m.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card key={m.id} className="border-sb-cream-dark bg-white">
                  <CardContent className="flex items-center gap-4 py-4">
                    <Avatar className="h-10 w-10 border border-sb-cream-dark">
                      {m.photo_url && (
                        <AvatarImage src={m.photo_url} alt={m.full_name} />
                      )}
                      <AvatarFallback className="bg-sb-green text-xs font-semibold text-sb-gold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-sb-green-dark">
                        {m.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.email} - {m.phone_number} - {m.town_or_city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered{" "}
                        {new Date(m.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => approveMember(m.id)}
                      disabled={approving === m.id}
                      className="bg-sb-green text-white hover:bg-sb-green-light"
                    >
                      {approving === m.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="mr-1 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mt-4 border-sb-cream-dark bg-white">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No pending approvals.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
