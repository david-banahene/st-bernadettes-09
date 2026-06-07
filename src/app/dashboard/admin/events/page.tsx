"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarDays,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";

const EVENT_TYPES = [
  "Meeting",
  "Fundraiser",
  "Reunion",
  "Marriage",
  "Funeral",
  "Welfare",
  "Social",
  "Other",
];

export default function AdminEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    setAuthorized(member?.role === "leader" || member?.role === "admin");
    setChecking(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let coverImageUrl: string | null = null;
    if (coverFile) {
      const fileExt = coverFile.name.split(".").pop();
      const filePath = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-covers")
        .upload(filePath, coverFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("event-covers")
          .getPublicUrl(filePath);
        coverImageUrl = urlData.publicUrl;
      }
    }

    const requiresPayment = (formData.get("paymentAmount") as string) !== "";
    const paymentAmount = requiresPayment
      ? parseFloat(formData.get("paymentAmount") as string)
      : null;

    const { error: insertError } = await supabase.from("events").insert({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      event_type: formData.get("eventType") as string,
      event_date: formData.get("eventDate") as string,
      end_date: (formData.get("endDate") as string) || null,
      location: formData.get("location") as string,
      cover_image_url: coverImageUrl,
      requires_payment: requiresPayment,
      payment_amount: paymentAmount,
      created_by: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push("/dashboard/events");
      router.refresh();
    }, 1500);
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to create events.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
            Create Event
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new event for the association
          </p>
        </div>
      </div>

      {success && (
        <Alert className="mt-4 border-sb-green/30 bg-sb-green/5">
          <CheckCircle2 className="h-4 w-4 text-sb-green" />
          <AlertDescription className="text-sb-green">
            Event created successfully. Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mt-6 border-sb-cream-dark bg-white">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Details */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Event Details
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="e.g., General Meeting - June 2026"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    placeholder="What is this event about?"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <select
                    id="eventType"
                    name="eventType"
                    required
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      required
                      placeholder="e.g., Kumasi Cultural Centre"
                      className="mt-1 pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Date & Time
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="eventDate">Start Date & Time *</Label>
                  <Input
                    id="eventDate"
                    name="eventDate"
                    type="datetime-local"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payment (optional)
              </h3>
              <div className="mt-3">
                <Label htmlFor="paymentAmount">Amount (GHS)</Label>
                <Input
                  id="paymentAmount"
                  name="paymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Leave empty if free"
                  className="mt-1 max-w-xs"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  If set, members will see payment instructions with the admin&apos;s MoMo details.
                </p>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cover Image
              </h3>
              <div className="mt-3">
                <Label htmlFor="cover">Upload an event poster or banner (optional)</Label>
                <Input
                  id="cover"
                  name="cover"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-sb-cream-dark pt-6">
              <Button
                type="submit"
                disabled={loading || success}
                className="bg-sb-green text-white hover:bg-sb-green-light"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
