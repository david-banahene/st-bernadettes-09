import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming events and activities for St. Bernadette's '09 Association members.",
};

export default function EventsPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-sb-green-dark py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Events
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/70">
              Stay updated on upcoming reunions, meetings, fundraisers, and
              social activities organized by the Association.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Empty State */}
        <Card className="border-sb-cream-dark bg-white">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sb-green/10 text-sb-green">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-sb-green-dark">
              No Upcoming Events
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              There are no scheduled events at this time. Check back soon or log
              in to your member dashboard for the latest updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
