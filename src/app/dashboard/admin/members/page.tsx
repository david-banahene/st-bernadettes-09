"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Users,
  Loader2,
  Search,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  town_or_city: string;
  photo_url: string | null;
  role: string;
  membership_status: string;
  good_standing: boolean;
  commitment_fee_paid: boolean;
  created_at: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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

    const { data } = await supabase
      .from("members")
      .select("*")
      .order("full_name");

    setMembers(data || []);
    setLoading(false);
  }

  async function updateRole(memberId: string, newRole: string) {
    setUpdating(memberId);
    const supabase = createClient();
    await supabase
      .from("members")
      .update({ role: newRole })
      .eq("id", memberId);
    await loadData();
    setUpdating(null);
  }

  async function updateStatus(memberId: string, newStatus: string) {
    setUpdating(memberId);
    const supabase = createClient();
    await supabase
      .from("members")
      .update({ membership_status: newStatus })
      .eq("id", memberId);
    await loadData();
    setUpdating(null);
  }

  async function toggleCommitmentFee(memberId: string, current: boolean) {
    setUpdating(memberId);
    const supabase = createClient();
    await supabase
      .from("members")
      .update({ commitment_fee_paid: !current })
      .eq("id", memberId);
    await loadData();
    setUpdating(null);
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

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    admin: "bg-sb-gold/10 text-sb-gold-dark",
    leader: "bg-sb-green/10 text-sb-green",
    member: "bg-gray-100 text-gray-600",
  };

  const statusColors: Record<string, string> = {
    active: "bg-sb-green/10 text-sb-green",
    pending: "bg-sb-gold/10 text-sb-gold-dark",
    suspended: "bg-red-50 text-red-600",
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/10 text-sb-gold-dark">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
            Manage Members
          </h1>
          <p className="text-sm text-muted-foreground">
            {members.length} total members
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Members List */}
      <div className="mt-6 space-y-3">
        {filtered.map((m) => {
          const initials = m.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <Card key={m.id} className="border-sb-cream-dark bg-white">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border border-sb-cream-dark">
                    {m.photo_url && (
                      <AvatarImage src={m.photo_url} alt={m.full_name} />
                    )}
                    <AvatarFallback className="bg-sb-green text-xs font-semibold text-sb-gold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-sb-green-dark">
                        {m.full_name}
                      </h3>
                      <Badge className={roleColors[m.role] + " text-[10px] capitalize"}>
                        {m.role}
                      </Badge>
                      <Badge className={statusColors[m.membership_status] + " text-[10px] capitalize"}>
                        {m.membership_status}
                      </Badge>
                      {m.good_standing && (
                        <Badge className="bg-sb-green/10 text-[10px] text-sb-green">
                          Good Standing
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.email} - {m.phone_number} - {m.town_or_city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Commitment fee: {m.commitment_fee_paid ? "Paid" : "Not paid"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex flex-wrap gap-2 border-t border-sb-cream-dark pt-3">
                  {/* Role Controls */}
                  <div className="flex items-center gap-1">
                    <span className="mr-1 text-xs text-muted-foreground">Role:</span>
                    {["member", "leader", "admin"].map((role) => (
                      <Button
                        key={role}
                        size="sm"
                        variant={m.role === role ? "default" : "outline"}
                        onClick={() => updateRole(m.id, role)}
                        disabled={updating === m.id}
                        className={
                          m.role === role
                            ? "h-7 bg-sb-green text-[11px] text-white hover:bg-sb-green-light"
                            : "h-7 text-[11px]"
                        }
                      >
                        {role}
                      </Button>
                    ))}
                  </div>

                  <div className="mx-2 hidden h-7 w-px bg-sb-cream-dark sm:block" />

                  {/* Status Controls */}
                  <div className="flex items-center gap-1">
                    <span className="mr-1 text-xs text-muted-foreground">Status:</span>
                    {m.membership_status === "pending" ? (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(m.id, "active")}
                        disabled={updating === m.id}
                        className="h-7 bg-sb-green text-[11px] text-white hover:bg-sb-green-light"
                      >
                        <UserCheck className="mr-1 h-3 w-3" />
                        Approve
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant={m.membership_status === "active" ? "default" : "outline"}
                          onClick={() => updateStatus(m.id, "active")}
                          disabled={updating === m.id}
                          className={
                            m.membership_status === "active"
                              ? "h-7 bg-sb-green text-[11px] text-white hover:bg-sb-green-light"
                              : "h-7 text-[11px]"
                          }
                        >
                          Active
                        </Button>
                        <Button
                          size="sm"
                          variant={m.membership_status === "suspended" ? "default" : "outline"}
                          onClick={() => updateStatus(m.id, "suspended")}
                          disabled={updating === m.id}
                          className={
                            m.membership_status === "suspended"
                              ? "h-7 bg-red-500 text-[11px] text-white hover:bg-red-600"
                              : "h-7 text-[11px]"
                          }
                        >
                          Suspend
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="mx-2 hidden h-7 w-px bg-sb-cream-dark sm:block" />

                  {/* Commitment Fee Toggle */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleCommitmentFee(m.id, m.commitment_fee_paid)}
                    disabled={updating === m.id}
                    className="h-7 text-[11px]"
                  >
                    {m.commitment_fee_paid ? "Undo Commitment Fee" : "Mark Fee Paid"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
