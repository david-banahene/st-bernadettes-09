"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle,
} from "lucide-react";

const WELFARE_TYPES = [
  { value: "bereavement_member", label: "Bereavement - Member" },
  { value: "bereavement_mother", label: "Bereavement - Mother" },
  { value: "bereavement_father", label: "Bereavement - Father" },
  { value: "bereavement_spouse", label: "Bereavement - Spouse" },
  { value: "bereavement_child", label: "Bereavement - Child" },
  { value: "sickness", label: "Sickness" },
  { value: "other", label: "Other" },
];

interface WelfareRequest {
  id: string;
  type: string;
  description: string;
  status: string;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  member?: { full_name: string; photo_url: string | null; phone_number: string };
  reviewer?: { full_name: string };
}

export default function WelfarePage() {
  const [requests, setRequests] = useState<WelfareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLeaderOrAdmin, setIsLeaderOrAdmin] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    const leaderAdmin = member?.role === "leader" || member?.role === "admin";
    setIsLeaderOrAdmin(leaderAdmin);

    let query;
    if (leaderAdmin) {
      query = supabase
        .from("welfare_requests")
        .select("*, member:members!welfare_requests_member_id_fkey(full_name, photo_url, phone_number), reviewer:members!welfare_requests_reviewed_by_fkey(full_name)")
        .order("created_at", { ascending: false });
    } else {
      query = supabase
        .from("welfare_requests")
        .select("*, reviewer:members!welfare_requests_reviewed_by_fkey(full_name)")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false });
    }

    const { data } = await query;
    setRequests((data as WelfareRequest[]) || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase
      .from("welfare_requests")
      .insert({
        member_id: user.id,
        type: formData.get("type") as string,
        description: formData.get("description") as string,
      });

    if (insertError) {
      setError(insertError.message);
      toast.error("Failed to submit request");
      setSubmitting(false);
      return;
    }

    toast.success("Welfare request submitted");
    setShowForm(false);
    setSubmitting(false);
    await loadData();
  }

  async function handleReview(requestId: string, decision: "approved" | "declined") {
    setReviewing(requestId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("welfare_requests")
      .update({
        status: decision,
        reviewed_by: user.id,
        review_notes: reviewNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    // Send email notification to the member about the decision
    try {
      await fetch("/api/email/welfare-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          decision,
          notes: reviewNote || null,
        }),
      });
    } catch {
      // Email failure should not block the review
    }

    toast.success(`Request ${decision}`);
    setReviewNote("");
    setReviewing(null);
    await loadData();
  }

  function typeLabel(value: string) {
    return WELFARE_TYPES.find((t) => t.value === value)?.label || value;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
              Welfare
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLeaderOrAdmin
                ? "Review and manage welfare requests"
                : "Submit welfare requests to the association"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-sb-green text-white hover:bg-sb-green-light"
        >
          <Plus className="mr-2 h-4 w-4" />
          Submit Request
        </Button>
      </div>

      {/* Info Banner */}
      {!isLeaderOrAdmin && !showForm && requests.length === 0 && (
        <Card className="mt-6 border-sb-gold/20 bg-sb-gold/5">
          <CardContent className="pt-6">
            <p className="text-sm text-sb-gold-dark">
              Per Article 8 of the constitution, the association provides welfare
              support for bereavement (member, parent, spouse, child) and
              sickness. Submit a request and the leadership will review it.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit Form */}
      {showForm && (
        <Card className="mt-6 border-sb-cream-dark bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-sb-green-dark">
              New Welfare Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type of Request *</label>
                <select
                  name="type"
                  required
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {WELFARE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Provide details about your welfare request..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-sb-green text-white hover:bg-sb-green-light"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-sb-green-dark">
            {isLeaderOrAdmin ? "Pending Review" : "Awaiting Review"}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({pending.length})
            </span>
          </h2>
          <div className="mt-4 space-y-3">
            {pending.map((req) => (
              <WelfareCard
                key={req.id}
                request={req}
                expanded={expandedId === req.id}
                onToggle={() =>
                  setExpandedId(expandedId === req.id ? null : req.id)
                }
                isLeaderOrAdmin={isLeaderOrAdmin}
                typeLabel={typeLabel}
                reviewNote={reviewNote}
                onReviewNoteChange={setReviewNote}
                onReview={(decision) => handleReview(req.id, decision)}
                reviewing={reviewing === req.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resolved Requests */}
      {resolved.length > 0 && (
        <div className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-sb-green-dark">
            Resolved
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({resolved.length})
            </span>
          </h2>
          <div className="mt-4 space-y-3">
            {resolved.map((req) => (
              <WelfareCard
                key={req.id}
                request={req}
                expanded={expandedId === req.id}
                onToggle={() =>
                  setExpandedId(expandedId === req.id ? null : req.id)
                }
                isLeaderOrAdmin={isLeaderOrAdmin}
                typeLabel={typeLabel}
                reviewNote={reviewNote}
                onReviewNoteChange={setReviewNote}
                onReview={(decision) => handleReview(req.id, decision)}
                reviewing={reviewing === req.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && !showForm && (
        <Card className="mt-8 border-sb-cream-dark bg-white">
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-sb-cream-dark" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isLeaderOrAdmin
                ? "No welfare requests to review."
                : "No welfare requests submitted yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WelfareCard({
  request,
  expanded,
  onToggle,
  isLeaderOrAdmin,
  typeLabel,
  reviewNote,
  onReviewNoteChange,
  onReview,
  reviewing,
}: {
  request: WelfareRequest;
  expanded: boolean;
  onToggle: () => void;
  isLeaderOrAdmin: boolean;
  typeLabel: (v: string) => string;
  reviewNote: string;
  onReviewNoteChange: (v: string) => void;
  onReview: (decision: "approved" | "declined") => void;
  reviewing: boolean;
}) {
  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: "bg-sb-gold/10 text-sb-gold-dark", label: "Pending" },
    approved: { icon: CheckCircle2, color: "bg-sb-green/10 text-sb-green", label: "Approved" },
    declined: { icon: XCircle, color: "bg-red-50 text-red-600", label: "Declined" },
  };

  const status = statusConfig[request.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Card className="border-sb-cream-dark bg-white">
      <CardContent className="pt-5">
        <button
          onClick={onToggle}
          className="flex w-full items-start justify-between text-left"
        >
          <div className="flex items-start gap-3">
            {isLeaderOrAdmin && request.member && (
              <Avatar className="h-8 w-8 border border-sb-cream-dark">
                {request.member.photo_url && (
                  <AvatarImage src={request.member.photo_url} alt={request.member.full_name} />
                )}
                <AvatarFallback className="bg-sb-green text-[10px] font-semibold text-sb-gold">
                  {request.member.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-sb-green-dark">
                  {typeLabel(request.type)}
                </h3>
                <Badge className={status.color + " text-[10px]"}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              {isLeaderOrAdmin && request.member && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {request.member.full_name} - {request.member.phone_number}
                </p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(request.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Description */}
            <div className="rounded-lg bg-sb-cream p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Details
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-sb-green-dark">
                {request.description}
              </p>
            </div>

            {/* Review Notes (if reviewed) */}
            {request.review_notes && (
              <div className={`rounded-lg p-3 ${
                request.status === "approved"
                  ? "border border-sb-green/20 bg-sb-green/5"
                  : "border border-red-200 bg-red-50"
              }`}>
                <p className="text-xs font-semibold text-muted-foreground">
                  Review Notes by {request.reviewer?.full_name || "Leader"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-sb-green-dark">
                  {request.review_notes}
                </p>
                {request.reviewed_at && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(request.reviewed_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}

            {/* Review Actions (Leaders only, pending only) */}
            {isLeaderOrAdmin && request.status === "pending" && (
              <div className="space-y-3">
                <textarea
                  value={reviewNote}
                  onChange={(e) => onReviewNoteChange(e.target.value)}
                  placeholder="Add review notes (optional)..."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => onReview("approved")}
                    disabled={reviewing}
                    className="bg-sb-green text-white hover:bg-sb-green-light"
                  >
                    {reviewing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => onReview("declined")}
                    disabled={reviewing}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
