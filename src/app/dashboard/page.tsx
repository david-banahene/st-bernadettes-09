import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  Megaphone,
  Heart,
  Cake,
  UserCircle,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("members")
    .select("full_name, role, good_standing, membership_status, photo_url, date_of_birth, phone_number, town_or_city, next_of_kin, emergency_contact_name, parents_names")
    .eq("id", user!.id)
    .single();

  const firstName = member?.full_name?.split(" ")[0] || "Member";

  const { count: memberCount } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  // Upcoming events count
  const { count: upcomingEventCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .gt("event_date", new Date().toISOString())
    .neq("status", "cancelled");

  // Birthday celebrants this month
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const { data: allMembers } = await supabase
    .from("members")
    .select("full_name, photo_url, date_of_birth")
    .not("date_of_birth", "is", null);

  const birthdayMembers = (allMembers || []).filter((m) => {
    if (!m.date_of_birth) return false;
    const dob = new Date(m.date_of_birth);
    return dob.getMonth() + 1 === currentMonth;
  });

  // Recent announcements
  const { data: recentAnnouncements } = await supabase
    .from("announcements")
    .select("id, title, content, pinned, created_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  // Announcements count
  const { count: announcementCount } = await supabase
    .from("announcements")
    .select("*", { count: "exact", head: true });

  // Upcoming events for the bottom card
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, event_date, location, event_type")
    .gt("event_date", new Date().toISOString())
    .neq("status", "cancelled")
    .order("event_date", { ascending: true })
    .limit(3);

  // Profile completeness check
  const missingFields: string[] = [];
  if (!member?.photo_url) missingFields.push("Profile photo");
  if (!member?.date_of_birth) missingFields.push("Date of birth");
  const profileComplete = missingFields.length === 0;

  return (
    <div>
      {/* Welcome */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          St. Bernadette&apos;s &apos;09 Association Dashboard
        </p>
      </div>

      {/* Profile Completion Prompt */}
      {!profileComplete && (
        <Link href="/dashboard/profile">
          <Card className="mt-4 border-sb-gold/30 bg-sb-gold/5 transition-colors hover:bg-sb-gold/10">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sb-gold/10">
                <UserCircle className="h-5 w-5 text-sb-gold-dark" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-sb-gold-dark">
                  Complete Your Profile
                </p>
                <p className="text-xs text-muted-foreground">
                  Missing: {missingFields.join(", ")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-sb-gold-dark" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Upcoming Events</p>
              <p className="text-xl font-bold text-sb-green-dark">{upcomingEventCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/8 text-sb-gold-dark">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-xl font-bold text-sb-green-dark">{memberCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Announcements</p>
              <p className="text-xl font-bold text-sb-green-dark">{announcementCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-gold/8 text-sb-gold-dark">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Standing</p>
              <p className="text-xl font-bold text-sb-green-dark">
                {member?.good_standing ? "Good" : "Pending"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Cards */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Birthday Celebrants */}
        <Card className="border-sb-cream-dark bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-sb-green-dark">
              <Cake className="h-4 w-4 text-sb-gold" />
              Birthday Celebrants This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {birthdayMembers.length > 0 ? (
              <div className="space-y-3">
                {birthdayMembers.map((bm, i) => {
                  const initials = bm.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const day = new Date(bm.date_of_birth!).getDate();
                  const monthName = new Date(bm.date_of_birth!).toLocaleDateString("en-GB", { month: "short" });
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-sb-gold/20">
                        {bm.photo_url && <AvatarImage src={bm.photo_url} alt={bm.full_name} />}
                        <AvatarFallback className="bg-sb-green text-[10px] font-semibold text-sb-gold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sb-green-dark">
                          {bm.full_name}
                        </p>
                      </div>
                      <Badge className="bg-sb-gold/10 text-[10px] text-sb-gold-dark">
                        {day} {monthName}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No birthdays this month.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="border-sb-cream-dark bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-sb-green-dark">
              <span>Recent Announcements</span>
              <Link
                href="/dashboard/announcements"
                className="text-xs font-normal text-sb-green hover:underline"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnnouncements && recentAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {recentAnnouncements.map((a) => (
                  <div key={a.id} className="border-b border-sb-cream-dark pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-sb-green-dark">
                        {a.title}
                      </p>
                      {a.pinned && (
                        <Badge className="bg-sb-gold/10 text-[9px] text-sb-gold-dark">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {a.content}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No announcements yet. Check back soon.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-sb-cream-dark bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-sb-green-dark">
              <span>Upcoming Events</span>
              <Link
                href="/dashboard/events"
                className="text-xs font-normal text-sb-green hover:underline"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <Link key={ev.id} href={`/dashboard/events/${ev.id}`}>
                    <div className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-sb-cream">
                      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
                        <span className="text-xs font-bold leading-none">
                          {new Date(ev.event_date).getDate()}
                        </span>
                        <span className="text-[9px] uppercase">
                          {new Date(ev.event_date).toLocaleDateString("en-GB", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sb-green-dark">
                          {ev.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ev.location}
                        </p>
                      </div>
                      <Badge className="bg-sb-cream text-[10px] text-muted-foreground">
                        {ev.event_type}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming events. Check back soon.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
