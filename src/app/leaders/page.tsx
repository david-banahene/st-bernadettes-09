import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Leaders",
  description:
    "Meet the executive officers of St. Bernadette's '09 Association.",
};

type Leader = {
  name: string;
  position: string;
  profession: string;
  bio?: string;
  initials: string;
  email?: string;
  phone?: string;
};

const leaders: Leader[] = [
  // TODO: Replace with real data from database in Phase 2
  {
    name: "To Be Announced",
    position: "President",
    profession: "",
    bio: "Leads the Association, chairs meetings, and represents the group in official matters.",
    initials: "P",
  },
  {
    name: "To Be Announced",
    position: "Vice President",
    profession: "",
    bio: "Assists the President and acts in their absence.",
    initials: "VP",
  },
  {
    name: "To Be Announced",
    position: "General Secretary",
    profession: "",
    bio: "Records minutes, manages correspondence, and maintains the member register.",
    initials: "GS",
  },
  {
    name: "To Be Announced",
    position: "Treasurer",
    profession: "",
    bio: "Manages financial records, collects dues, and safeguards Association funds.",
    initials: "T",
  },
  {
    name: "To Be Announced",
    position: "Financial Secretary",
    profession: "",
    bio: "Tracks member payments and assists in financial reporting.",
    initials: "FS",
  },
  {
    name: "To Be Announced",
    position: "Organizer",
    profession: "",
    bio: "Coordinates meetings, events, and member mobilization.",
    initials: "O",
  },
];

export default function LeadersPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-sb-green-dark py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Our Leaders
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70">
              Executive officers serving the Association. Each holds a two-year
              term as outlined in the Constitution.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <Card
              key={leader.position}
              className="border-sb-cream-dark bg-white transition-shadow hover:shadow-lg"
            >
              <CardContent className="flex flex-col items-center pt-8 text-center">
                {/* Avatar */}
                <Avatar className="h-20 w-20 border-3 border-sb-gold">
                  <AvatarFallback className="bg-sb-green text-lg font-bold text-sb-gold">
                    {leader.initials}
                  </AvatarFallback>
                </Avatar>

                {/* Position Badge */}
                <Badge className="mt-4 bg-sb-gold/10 text-sb-gold-dark hover:bg-sb-gold/20 border-sb-gold/20">
                  {leader.position}
                </Badge>

                {/* Name */}
                <h3 className="mt-3 text-lg font-semibold text-sb-green-dark">
                  {leader.name}
                </h3>

                {/* Profession */}
                {leader.profession && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {leader.profession}
                  </p>
                )}

                {/* Bio / Role description */}
                {leader.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {leader.bio}
                  </p>
                )}

                {/* Contact (visible when data is available) */}
                {(leader.email || leader.phone) && (
                  <div className="mt-4 flex items-center gap-4 border-t border-sb-cream-dark pt-4">
                    {leader.email && (
                      <a
                        href={`mailto:${leader.email}`}
                        className="flex items-center gap-1.5 text-xs text-sb-green hover:text-sb-green-light"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </a>
                    )}
                    {leader.phone && (
                      <a
                        href={`tel:${leader.phone}`}
                        className="flex items-center gap-1.5 text-xs text-sb-green hover:text-sb-green-light"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Officers serve two-year terms with one re-election allowed (Articles 10-12).
          </p>
        </div>
      </div>
    </>
  );
}
