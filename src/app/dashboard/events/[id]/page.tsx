import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  MapPin,
  Clock,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EventCountdown } from "../event-countdown";
import { EventPaymentSection } from "./event-payment-section";
import { EventWhatsAppShare } from "./event-whatsapp-share";
import { EventPhotoGallery } from "./event-photo-gallery";

const ghanaTime = { timeZone: "Africa/Accra" } as const;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) return notFound();

  const { data: currentMember } = await supabase
    .from("members")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isLeaderOrAdmin =
    currentMember?.role === "leader" || currentMember?.role === "admin";

  const isPast = new Date(event.event_date) <= new Date();

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
      {/* Back link */}
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-sb-green-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Cover Image */}
      {event.cover_image_url ? (
        <div className="mt-4 h-48 w-full overflow-hidden rounded-xl sm:h-64">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="mt-4 flex h-32 w-full items-center justify-center rounded-xl bg-sb-cream">
          <ImageIcon className="h-10 w-10 text-sb-cream-dark" />
        </div>
      )}

      {/* Event Header */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={typeColors[event.event_type] || typeColors.Other}>
            {event.event_type}
          </Badge>
          {isPast && (
            <Badge className="bg-gray-100 text-gray-500">Completed</Badge>
          )}
          {event.requires_payment && (
            <Badge className="bg-sb-gold/10 text-sb-gold-dark">
              GHS {event.payment_amount}
            </Badge>
          )}
        </div>
        <h1 className="mt-2 font-heading text-2xl font-bold text-sb-green-dark sm:text-3xl">
          {event.title}
        </h1>
        {!isPast && (
          <div className="mt-2">
            <EventCountdown eventDate={event.event_date} />
          </div>
        )}
      </div>

      {/* Details Row */}
      <Card className="mt-6 border-sb-cream-dark bg-white">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium text-sb-green-dark">
                {new Date(event.event_date).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  ...ghanaTime,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-gold/8 text-sb-gold-dark">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time (Ghana)</p>
              <p className="text-sm font-medium text-sb-green-dark">
                {new Date(event.event_date).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  ...ghanaTime,
                })}
                {event.end_date &&
                  ` - ${new Date(event.end_date).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    ...ghanaTime,
                  })}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium text-sb-green-dark">
                {event.location}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="mt-4 border-sb-cream-dark bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-sb-green-dark">
            About this event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </CardContent>
      </Card>

      {/* WhatsApp Share */}
      <div className="mt-4">
        <EventWhatsAppShare event={event} />
      </div>

      {/* Payment Section (only for paid events that haven't passed) */}
      {event.requires_payment && !isPast && (
        <div className="mt-4">
          <EventPaymentSection
            eventId={event.id}
            amount={event.payment_amount}
            userId={user!.id}
            isLeaderOrAdmin={isLeaderOrAdmin}
          />
        </div>
      )}

      {/* Admin Payment Management (for past paid events too) */}
      {event.requires_payment && isLeaderOrAdmin && isPast && (
        <div className="mt-4">
          <EventPaymentSection
            eventId={event.id}
            amount={event.payment_amount}
            userId={user!.id}
            isLeaderOrAdmin={isLeaderOrAdmin}
          />
        </div>
      )}

      {/* Photo Gallery */}
      <div className="mt-4">
        <EventPhotoGallery
          eventId={event.id}
          isLeaderOrAdmin={isLeaderOrAdmin}
          isPast={isPast}
        />
      </div>
    </div>
  );
}
