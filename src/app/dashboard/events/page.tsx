import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Clock,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { EventCountdown } from "./event-countdown";

const ghanaTime = { timeZone: "Africa/Accra" } as const;

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: currentMember } = await supabase
    .from("members")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isLeaderOrAdmin =
    currentMember?.role === "leader" || currentMember?.role === "admin";

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  const now = new Date().toISOString();
  const upcoming = (events || []).filter((e) => e.event_date > now && e.status !== "cancelled");
  const past = (events || []).filter((e) => e.event_date <= now || e.status === "completed");

  const typeColors: Record<string, string> = {
    Meeting: "bg-blue-50 text-blue-700",
    Fundraiser: "bg-sb-gold/10 text-sb-gold-dark",
    Reunion: "bg-sb-green/10 text-sb-green",
    Marriage: "bg-rose-50 text-rose-700",
    Funeral: "bg-slate-100 text-slate-700",
    Welfare: "bg-pink-50 text-pink-700",
    Social: "bg-purple-50 text-purple-700",
    Other: "bg-gray-50 text-gray-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
              Events
            </h1>
            <p className="text-sm text-muted-foreground">
              Association gatherings and activities
            </p>
          </div>
        </div>
        {isLeaderOrAdmin && (
          <Link href="/dashboard/admin/events">
            <Button className="bg-sb-green text-white hover:bg-sb-green-light">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-sb-green-dark">
          Upcoming Events
        </h2>
        {upcoming.length > 0 ? (
          <div className="mt-4 space-y-4">
            {upcoming.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                <Card className="border-sb-cream-dark bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-sb-gold/30 cursor-pointer">
                  <CardContent className="flex gap-5 pt-6">
                    {event.cover_image_url ? (
                      <div className="hidden h-28 w-44 shrink-0 overflow-hidden rounded-lg sm:block">
                        <img
                          src={event.cover_image_url}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="hidden h-28 w-44 shrink-0 items-center justify-center rounded-lg bg-sb-cream sm:flex">
                        <ImageIcon className="h-8 w-8 text-sb-cream-dark" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-heading text-base font-bold text-sb-green-dark">
                              {event.title}
                            </h3>
                            <Badge className={typeColors[event.event_type] || typeColors.Other + " text-[10px]"}>
                              {event.event_type}
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(event.event_date).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            ...ghanaTime,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(event.event_date).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            ...ghanaTime,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.location}
                        </span>
                        {event.requires_payment && (
                          <Badge className="bg-sb-gold/10 text-[10px] text-sb-gold-dark">
                            GHS {event.payment_amount}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <EventCountdown eventDate={event.event_date} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="mt-4 border-sb-cream-dark bg-white">
            <CardContent className="py-12 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-sb-cream-dark" />
              <p className="mt-2 text-sm text-muted-foreground">
                No upcoming events. Check back soon.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Events */}
      {past.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-sb-green-dark">
            Past Events
          </h2>
          <div className="mt-4 space-y-3">
            {past.map((event) => (
              <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                <Card className="border-sb-cream-dark bg-white/70 transition-colors hover:bg-white cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-sb-green-dark">
                          {event.title}
                        </h3>
                        <Badge className={typeColors[event.event_type] || typeColors.Other + " text-[10px]"}>
                          {event.event_type}
                        </Badge>
                        <Badge className="bg-gray-100 text-[10px] text-gray-500">
                          Completed
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(event.event_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            ...ghanaTime,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
