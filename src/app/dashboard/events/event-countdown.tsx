"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
  eventDate: string;
}

export function EventCountdown({ eventDate }: Props) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function calc() {
      const diff = new Date(eventDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Event has started");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    }

    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (!timeLeft) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sb-green/8 px-2.5 py-0.5 text-[11px] font-medium text-sb-green">
      <Clock className="h-3 w-3" />
      {timeLeft}
    </span>
  );
}
