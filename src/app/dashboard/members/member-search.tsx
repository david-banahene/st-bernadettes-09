"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Search } from "lucide-react";
import { MemberDetailPanel } from "./member-detail-panel";

type Member = {
  id: string;
  full_name: string;
  photo_url: string | null;
  town_or_city: string;
  role: string;
  membership_status: string;
  phone_number: string;
  email: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  date_of_birth: string | null;
};

type Props = {
  members: Member[];
  isLeaderOrAdmin: boolean;
};

export function MemberSearch({ members, isLeaderOrAdmin }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.town_or_city.toLowerCase().includes(search.toLowerCase())
  );

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <>
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or town..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <Card
            key={member.id}
            className={`border-sb-cream-dark bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
              isLeaderOrAdmin ? "cursor-pointer hover:border-sb-gold/30" : ""
            }`}
            onClick={() => isLeaderOrAdmin && setSelectedMember(member)}
          >
            <CardContent className="flex items-center gap-4 pt-6">
              <Avatar className="h-12 w-12 shrink-0 border border-sb-gold/20">
                {member.photo_url && (
                  <AvatarImage src={member.photo_url} alt={member.full_name} />
                )}
                <AvatarFallback className="bg-sb-green text-sm font-semibold text-sb-gold">
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sb-green-dark">
                  {member.full_name}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{member.town_or_city}</span>
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  {member.role !== "member" && (
                    <Badge className="bg-sb-gold/10 px-1.5 text-[10px] text-sb-gold-dark">
                      {member.role}
                    </Badge>
                  )}
                  <Badge
                    className={
                      member.membership_status === "active"
                        ? "bg-sb-green/10 px-1.5 text-[10px] text-sb-green"
                        : "bg-sb-gold/10 px-1.5 text-[10px] text-sb-gold-dark"
                    }
                  >
                    {member.membership_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            No members found matching &ldquo;{search}&rdquo;
          </p>
        </div>
      )}

      {isLeaderOrAdmin && selectedMember && (
        <MemberDetailPanel
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}
