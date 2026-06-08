"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  UserPlus,
  CalendarCheck,
  Save,
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
  created_at: string;
}

export default function DuesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [dues, setDues] = useState<DuesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Active collection month (displayed to members on payment wall)
  const [activeMonth, setActiveMonth] = useState("");
  const [savingActiveMonth, setSavingActiveMonth] = useState(false);

  // Month currently being viewed in the list below
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Bulk generate
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  // Add for specific member
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedAddMonth, setSelectedAddMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [addingForMember, setAddingForMember] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (authorized) loadDuesForMonth();
  }, [viewMonth, authorized]);

  async function loadInitial() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    // Load all active members
    const { data: allMembers } = await supabase
      .from("members")
      .select(
        "id, full_name, photo_url, phone_number, good_standing, commitment_fee_paid"
      )
      .eq("membership_status", "active")
      .order("full_name");

    setMembers(allMembers || []);

    // Load active collection month from settings
    const { data: setting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "active_collection_month")
      .maybeSingle();

    if (setting?.value) {
      // Stored as "2026-06-01", show as "2026-06" in selectors
      setActiveMonth(setting.value.substring(0, 7));
    } else {
      const now = new Date();
      setActiveMonth(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      );
    }

    setLoading(false);
  }

  async function loadDuesForMonth() {
    const supabase = createClient();
    const monthStart = `${viewMonth}-01`;
    const { data: monthDues } = await supabase
      .from("monthly_dues")
      .select("*")
      .eq("month", monthStart);

    setDues(monthDues || []);
  }

  // ---------- Actions ----------

  async function saveActiveMonth() {
    setSavingActiveMonth(true);
    const supabase = createClient();

    await supabase.from("app_settings").upsert({
      key: "active_collection_month",
      value: `${activeMonth}-01`,
      updated_at: new Date().toISOString(),
    });

    toast.success(
      `Active collection month set to ${formatMonth(activeMonth)}`
    );
    setSavingActiveMonth(false);
  }

  async function generateDuesForAll() {
    setGenerating(true);
    const supabase = createClient();
    const monthStart = `${viewMonth}-01`;

    // Only create records for members who don't already have one this month
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
      toast.success(`Created dues for ${newDues.length} members`);
    } else {
      toast.info("All members already have dues for this month");
    }

    setGenerating(false);
    await loadDuesForMonth();
  }

  async function addDuesForMember() {
    if (!selectedMemberId || !selectedAddMonth) return;
    setAddingForMember(true);
    const supabase = createClient();
    const monthStart = `${selectedAddMonth}-01`;

    // Prevent duplicates
    const { data: existing } = await supabase
      .from("monthly_dues")
      .select("id")
      .eq("member_id", selectedMemberId)
      .eq("month", monthStart)
      .maybeSingle();

    if (existing) {
      toast.error("Dues already exist for this member for this month");
      setAddingForMember(false);
      return;
    }

    await supabase.from("monthly_dues").insert({
      member_id: selectedMemberId,
      month: monthStart,
      amount: 20.0,
      status: "pending",
    });

    const memberName =
      members.find((m) => m.id === selectedMemberId)?.full_name || "Member";
    toast.success(
      `Added ${formatMonth(selectedAddMonth)} dues for ${memberName}`
    );
    setAddingForMember(false);

    // Refresh list if we are viewing the same month
    if (selectedAddMonth === viewMonth) {
      await loadDuesForMonth();
    }
  }

  async function confirmPayment(duesId: string) {
    setConfirming(duesId);
    const supabase = createClient();

    const duesRecord = dues.find((d) => d.id === duesId);

    await supabase
      .from("monthly_dues")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", duesId);

    // Auto-recalculate standing for this member
    if (duesRecord) {
      const memberId = duesRecord.member_id;
      const member = members.find((m) => m.id === memberId);

      const { count: totalDues } = await supabase
        .from("monthly_dues")
        .select("*", { count: "exact", head: true })
        .eq("member_id", memberId);

      const { count: paidDues } = await supabase
        .from("monthly_dues")
        .select("*", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("status", "paid");

      const allDuesPaid =
        totalDues !== null && totalDues > 0 && paidDues === totalDues;
      const goodStanding =
        (member?.commitment_fee_paid ?? false) && allDuesPaid;

      await supabase
        .from("members")
        .update({ good_standing: goodStanding })
        .eq("id", memberId);
    }

    toast.success("Payment confirmed");
    setConfirming(null);
    await loadDuesForMonth();
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

      const allDuesPaid =
        totalMonths !== null && totalMonths > 0 && paidMonths === totalMonths;
      const goodStanding = member.commitment_fee_paid && allDuesPaid;

      await supabase
        .from("members")
        .update({ good_standing: goodStanding })
        .eq("id", member.id);
    }

    toast.success("Standing updated for all members");
    await loadDuesForMonth();
  }

  // ---------- Helpers ----------

  function formatMonth(monthStr: string) {
    return new Date(`${monthStr}-01`).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }

  // Last 12 months + next month (13 options total)
  function getMonthOptions() {
    const options: string[] = [];
    const now = new Date();
    for (let i = -11; i <= 1; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      options.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      );
    }
    return options;
  }

  // ---------- Render ----------

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
  const claimedCount = dues.filter((d) => d.status === "member_claimed").length;
  const membersWithoutDues = members.filter(
    (m) => !dues.find((d) => d.member_id === m.id)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/10 text-sb-gold-dark">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
              Dues Management
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
          <span className="hidden sm:inline">Update Standing</span>
        </Button>
      </div>

      {/* Active Collection Month */}
      <Card className="mt-6 border-sb-gold/30 bg-sb-gold/5">
        <CardContent className="pt-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sb-gold-dark">
            <CalendarCheck className="h-4 w-4" />
            Active Collection Month
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Members see this on the payment wall so they know what month is
            being collected.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <select
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
              className="rounded-md border border-sb-gold/30 bg-white px-3 py-2 text-sm font-medium text-sb-green-dark"
            >
              {getMonthOptions().map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={saveActiveMonth}
              disabled={savingActiveMonth}
              className="bg-sb-gold text-white hover:bg-sb-gold-dark"
            >
              {savingActiveMonth ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Set Active
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Action Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Generate for All Members */}
        <Card className="border-sb-cream-dark bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-sb-green-dark">
              <Plus className="h-4 w-4 text-sb-green" />
              Generate for All Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Creates a GHS 20 record for every active member who does not
              already have one for the month you are viewing below.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Month:</span>
              <span className="text-sm font-medium text-sb-green-dark">
                {formatMonth(viewMonth)}
              </span>
            </div>
            <Button
              onClick={generateDuesForAll}
              disabled={generating}
              className="mt-3 w-full bg-sb-green text-white hover:bg-sb-green-light"
              size="sm"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Generate for {formatMonth(viewMonth)}
            </Button>
          </CardContent>
        </Card>

        {/* Add for Specific Member */}
        <Card className="border-sb-cream-dark bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-sb-green-dark">
              <UserPlus className="h-4 w-4 text-sb-gold-dark" />
              Add for Specific Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Add dues for one member for a specific month. Use this for
              backdated arrears (e.g. April, May).
            </p>
            <div className="mt-3 space-y-2">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
              <select
                value={selectedAddMonth}
                onChange={(e) => setSelectedAddMonth(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {getMonthOptions().map((m) => (
                  <option key={m} value={m}>
                    {formatMonth(m)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={addDuesForMember}
              disabled={addingForMember || !selectedMemberId}
              className="mt-3 w-full bg-sb-gold text-white hover:bg-sb-gold-dark"
              size="sm"
            >
              {addingForMember ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Add Dues
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* View Month Selector */}
      <div className="mt-8 flex items-center gap-4 border-t border-sb-cream-dark pt-6">
        <span className="text-sm font-medium text-sb-green-dark">
          Viewing:
        </span>
        <select
          value={viewMonth}
          onChange={(e) => setViewMonth(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
        >
          {getMonthOptions().map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-bold text-sb-green-dark">
                {paidCount}/{dues.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-gold/8 text-sb-gold-dark">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Claims Paid</p>
              <p className="text-lg font-bold text-sb-green-dark">
                {claimedCount}
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

      {/* Dues List for Selected Month */}
      {dues.length > 0 ? (
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
            const isClaimed = memberDues.status === "member_claimed";

            return (
              <Card
                key={m.id}
                className={
                  isClaimed
                    ? "border-sb-gold/30 bg-sb-gold/5"
                    : "border-sb-cream-dark bg-white"
                }
              >
                <CardContent className="flex items-center gap-4 py-3">
                  <Avatar className="h-8 w-8 border border-sb-cream-dark">
                    {m.photo_url && (
                      <AvatarImage src={m.photo_url} alt={m.full_name} />
                    )}
                    <AvatarFallback className="bg-sb-green text-[10px] font-semibold text-sb-gold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sb-green-dark truncate">
                      {m.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.phone_number}
                      {isClaimed && (
                        <span className="ml-2 font-medium text-sb-gold-dark">
                          Claims paid
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-sb-green-dark">
                      GHS {memberDues.amount}
                    </p>
                  </div>
                  {isPaid ? (
                    <Badge className="shrink-0 bg-sb-green/10 text-[10px] text-sb-green">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Paid
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => confirmPayment(memberDues.id)}
                      disabled={confirming === memberDues.id}
                      className={
                        isClaimed
                          ? "shrink-0 bg-sb-gold text-white hover:bg-sb-gold-dark"
                          : "shrink-0 bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }
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

          {/* Note about members without dues this month */}
          {membersWithoutDues.length > 0 && (
            <div className="mt-4 rounded-lg border border-dashed border-sb-cream-dark p-3">
              <p className="text-xs text-muted-foreground">
                {membersWithoutDues.length} active member(s) have no dues
                record for {formatMonth(viewMonth)}. Use &quot;Generate for
                All&quot; or &quot;Add for Specific Member&quot; above.
              </p>
            </div>
          )}
        </div>
      ) : (
        <Card className="mt-6 border-sb-cream-dark bg-white">
          <CardContent className="py-8 text-center">
            <DollarSign className="mx-auto h-8 w-8 text-sb-cream-dark" />
            <p className="mt-2 text-sm text-muted-foreground">
              No dues records for {formatMonth(viewMonth)}.
            </p>
            <p className="text-xs text-muted-foreground">
              Use the actions above to create them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
