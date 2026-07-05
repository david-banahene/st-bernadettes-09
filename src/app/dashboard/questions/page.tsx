"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageCircle,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle,
  Users,
  User,
  Shield,
} from "lucide-react";

interface Question {
  id: string;
  subject: string;
  message: string;
  status: string;
  is_broadcast: boolean;
  asked_to: string | null;
  asked_by: string;
  created_at: string;
  asker?: { full_name: string };
  recipient?: { full_name: string };
  responses?: QuestionResponse[];
}

interface QuestionResponse {
  id: string;
  message: string;
  created_at: string;
  responder?: { full_name: string };
}

interface MemberOption {
  id: string;
  full_name: string;
  role: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLeaderOrAdmin, setIsLeaderOrAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [sendTo, setSendTo] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: member } = await supabase
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();

    const leaderAdmin = member?.role === "leader" || member?.role === "admin";
    setIsLeaderOrAdmin(leaderAdmin);

    if (leaderAdmin) {
      const { data: allMembers } = await supabase
        .from("members")
        .select("id, full_name, role")
        .neq("id", user.id)
        .order("full_name");
      setMembers(allMembers || []);
    }

    const { data: qs } = await supabase
      .from("questions")
      .select("*, asker:members!questions_asked_by_fkey(full_name), recipient:members!questions_asked_to_fkey(full_name)")
      .order("created_at", { ascending: false });

    const questionsWithResponses: Question[] = [];
    for (const q of qs || []) {
      const { data: responses } = await supabase
        .from("question_responses")
        .select("*, responder:members(full_name)")
        .eq("question_id", q.id)
        .order("created_at", { ascending: true });

      questionsWithResponses.push({ ...q, responses: responses || [] });
    }

    setQuestions(questionsWithResponses);
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

    const rawSubject = (formData.get("subject") as string)?.trim();
    const message = formData.get("message") as string;

    const insertData: Record<string, unknown> = {
      asked_by: user.id,
      subject: rawSubject || message.slice(0, 50),
      message,
      is_broadcast: false,
      asked_to: null,
    };

    if (isLeaderOrAdmin) {
      if (sendTo === "all") {
        insertData.is_broadcast = true;
      } else {
        insertData.asked_to = sendTo;
      }
    }

    const { error: insertError } = await supabase
      .from("questions")
      .insert(insertData);

    if (insertError) {
      setError(insertError.message);
      toast.error("Failed to submit question");
      setSubmitting(false);
      return;
    }

    toast.success("Question submitted");
    setShowForm(false);
    setSubmitting(false);
    setSendTo("all");
    await loadData();
  }

  async function handleReply(questionId: string) {
    if (!replyText.trim()) return;
    setReplying(questionId);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("question_responses").insert({
      question_id: questionId,
      responded_by: user.id,
      message: replyText,
    });

    await supabase
      .from("questions")
      .update({ status: "answered" })
      .eq("id", questionId);

    // Send email notification to the question asker
    try {
      await fetch("/api/email/question-answered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          responseText: replyText,
        }),
      });
    } catch {
      // Email failure should not block the reply
    }

    toast.success("Response sent");
    setReplyText("");
    setReplying(null);
    await loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sb-green" />
      </div>
    );
  }

  const pending = questions.filter((q) => q.status === "pending");
  const answered = questions.filter((q) => q.status === "answered");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
              Questions
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLeaderOrAdmin
                ? "Ask or respond to questions"
                : "Ask questions to association leadership"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-sb-green text-white hover:bg-sb-green-light"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ask Question
        </Button>
      </div>

      {/* Ask Question Form */}
      {showForm && (
        <Card className="mt-6 border-sb-cream-dark bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-sb-green-dark">
              New Question
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
              {/* Send To (Leaders/Admin only) */}
              {isLeaderOrAdmin && (
                <div>
                  <label className="text-sm font-medium">Send To *</label>
                  <select
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">All Members (Broadcast)</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Input
                  name="subject"
                  placeholder="Subject (optional)"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Type your question here..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSendTo("all");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* All Questions - single unified list */}
      {questions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-1 rounded-full bg-sb-gold" />
              Pending ({pending.length})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-1 rounded-full bg-sb-green" />
              Answered ({answered.length})
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                expanded={expandedId === q.id}
                onToggle={() =>
                  setExpandedId(expandedId === q.id ? null : q.id)
                }
                isLeaderOrAdmin={isLeaderOrAdmin}
                currentUserId={currentUserId}
                replyText={replyText}
                onReplyChange={setReplyText}
                onReply={() => handleReply(q.id)}
                replying={replying === q.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {questions.length === 0 && !showForm && (
        <Card className="mt-8 border-sb-cream-dark bg-white">
          <CardContent className="py-12 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-sb-cream-dark" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isLeaderOrAdmin
                ? "No questions yet."
                : "No questions yet. Ask your first question to the leadership."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  expanded,
  onToggle,
  isLeaderOrAdmin,
  currentUserId,
  replyText,
  onReplyChange,
  onReply,
  replying,
}: {
  question: Question;
  expanded: boolean;
  onToggle: () => void;
  isLeaderOrAdmin: boolean;
  currentUserId: string;
  replyText: string;
  onReplyChange: (v: string) => void;
  onReply: () => void;
  replying: boolean;
}) {
  const isPending = question.status === "pending";
  const isMine = question.asked_by === currentUserId;
  const canReply = isLeaderOrAdmin || question.asked_to === currentUserId;

  // Get first response for the answer preview
  const firstResponse = question.responses?.[0];

  let directionLabel = "";
  if (question.is_broadcast) {
    directionLabel = "To all members";
  } else if (question.asked_to && question.recipient) {
    directionLabel = isMine
      ? `To ${question.recipient.full_name}`
      : `From ${question.asker?.full_name || "Unknown"}`;
  } else if (!isMine && question.asker) {
    directionLabel = `From ${question.asker.full_name}`;
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-sb-cream-dark bg-white transition-all duration-200",
        isPending ? "border-l-4 border-l-sb-gold" : "border-l-4 border-l-sb-green"
      )}
    >
      <CardContent className="pt-5">
        <button
          onClick={onToggle}
          className="flex w-full items-start justify-between text-left"
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-sb-green-dark">
                {question.subject}
              </h3>
              {isPending ? (
                <Badge className="bg-sb-gold/10 text-[10px] text-sb-gold-dark">
                  <Clock className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
              ) : (
                <Badge className="bg-sb-green/10 text-[10px] text-sb-green">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Answered
                </Badge>
              )}
              {question.is_broadcast && (
                <Badge className="bg-blue-50 text-[10px] text-blue-700">
                  <Users className="mr-1 h-3 w-3" />
                  Broadcast
                </Badge>
              )}
              {question.asked_to && (
                <Badge className="bg-purple-50 text-[10px] text-purple-700">
                  <User className="mr-1 h-3 w-3" />
                  Direct
                </Badge>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {new Date(question.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {directionLabel && (
                <>
                  <span>-</span>
                  <span>{directionLabel}</span>
                </>
              )}
            </div>

            {/* Answer preview in collapsed state */}
            {!expanded && firstResponse && (
              <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                <span className="font-medium text-sb-green">
                  {firstResponse.responder?.full_name || "Leadership"}:
                </span>{" "}
                {firstResponse.message}
              </p>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
            {/* Original Question */}
            <div className="rounded-lg bg-sb-cream p-3">
              <p className="text-xs font-medium text-sb-green-dark">
                {question.asker?.full_name || "Question"}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-sb-green-dark">
                {question.message}
              </p>
            </div>

            {/* Responses - indented with left border */}
            {question.responses && question.responses.length > 0 && (
              <div className="ml-4 space-y-2 border-l-2 border-sb-green/30 pl-3">
                {question.responses.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg bg-sb-green/5 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-sb-green" />
                      <p className="text-xs font-semibold text-sb-green">
                        {r.responder?.full_name || "Leadership"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-sb-green-dark">
                      {r.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            {canReply && (
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => onReplyChange(e.target.value)}
                  placeholder="Type your response..."
                  rows={2}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  onClick={onReply}
                  disabled={replying || !replyText.trim()}
                  className="self-end bg-sb-green text-white hover:bg-sb-green-light"
                >
                  {replying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
