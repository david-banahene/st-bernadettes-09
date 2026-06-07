"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Cake,
} from "lucide-react";

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
  member: Member;
  onClose: () => void;
};

export function MemberDetailPanel({ member, onClose }: Props) {
  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md animate-in slide-in-from-right bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sb-cream-dark p-4">
            <h2 className="font-heading text-lg font-bold text-sb-green-dark">
              Member Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-sb-green-dark"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 border-2 border-sb-gold/30">
                {member.photo_url && (
                  <AvatarImage src={member.photo_url} alt={member.full_name} />
                )}
                <AvatarFallback className="bg-sb-green text-xl font-bold text-sb-gold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-3 font-heading text-lg font-bold text-sb-green-dark">
                {member.full_name}
              </h3>
              <div className="mt-1 flex gap-2">
                <Badge className="bg-sb-cream text-xs capitalize text-sb-green">
                  {member.role}
                </Badge>
                <Badge
                  className={
                    member.membership_status === "active"
                      ? "bg-sb-green/10 text-xs text-sb-green"
                      : "bg-sb-gold/10 text-xs text-sb-gold-dark"
                  }
                >
                  {member.membership_status}
                </Badge>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{member.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{member.phone_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Town / City</p>
                  <p className="text-sm font-medium">{member.town_or_city}</p>
                </div>
              </div>

              {member.date_of_birth && (
                <div className="flex items-start gap-3">
                  <Cake className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium">
                      {new Date(member.date_of_birth).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-sb-cream-dark pt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="text-sm font-medium">{member.emergency_contact_name}</p>
                    <p className="text-xs text-muted-foreground">{member.emergency_contact_phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
