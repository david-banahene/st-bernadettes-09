"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface Props {
  event: {
    title: string;
    event_date: string;
    location: string;
    description: string;
    requires_payment: boolean;
    payment_amount: number | null;
  };
}

export function EventWhatsAppShare({ event }: Props) {
  function handleShare() {
    const tz = { timeZone: "Africa/Accra" } as const;
    const date = new Date(event.event_date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      ...tz,
    });
    const time = new Date(event.event_date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      ...tz,
    });

    let message = `*St. Bernadette's '09 Association*\n\n`;
    message += `*${event.title}*\n\n`;
    message += `Date: ${date}\n`;
    message += `Time: ${time}\n`;
    message += `Location: ${event.location}\n`;
    if (event.requires_payment && event.payment_amount) {
      message += `Fee: GHS ${event.payment_amount}\n`;
    }
    message += `\n${event.description}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className="border-sb-cream-dark text-sb-green-dark hover:bg-sb-green/5"
    >
      <Share2 className="mr-2 h-4 w-4" />
      Share on WhatsApp
    </Button>
  );
}
