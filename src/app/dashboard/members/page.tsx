import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users } from "lucide-react";
import { MemberSearch } from "./member-search";
import { MemberDetailPanel } from "./member-detail-panel";

export default async function MembersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: currentMember } = await supabase
    .from("members")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isLeaderOrAdmin =
    currentMember?.role === "leader" || currentMember?.role === "admin";

  const { data: members } = await supabase
    .from("members")
    .select(
      "id, full_name, photo_url, town_or_city, role, membership_status, phone_number, email, emergency_contact_name, emergency_contact_phone, date_of_birth"
    )
    .order("full_name");

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
            Member Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            {members?.length || 0} member{(members?.length || 0) !== 1 ? "s" : ""} registered
          </p>
        </div>
      </div>

      <MemberSearch
        members={members || []}
        isLeaderOrAdmin={isLeaderOrAdmin}
        currentUserId={user!.id}
      />
    </div>
  );
}
