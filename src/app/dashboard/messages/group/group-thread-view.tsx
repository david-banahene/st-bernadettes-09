"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  Reply,
  Send,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface GroupMessage {
  id: string;
  sender_id: string;
  content: string | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  reply_to_id: string | null;
}

interface MemberInfo {
  full_name: string;
  photo_url: string | null;
}

const GROUP_MESSAGE_COLUMNS =
  "id, sender_id, content, created_at, edited_at, deleted_at, deleted_by, reply_to_id";

// Deterministic per-sender name color, in the spirit of how WhatsApp/Slack
// give each group participant a consistent color: hash their (stable) id to
// a hue, keep saturation/lightness fixed so every color stays legible on the
// cream background, and steer clear of the hue this app already uses for
// its gold reply/accent color so a name never reads as "the accent."
function colorForSender(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  let hue = Math.abs(hash) % 360;
  if (hue >= 30 && hue <= 55) hue = (hue + 60) % 360;
  return `hsl(${hue} 55% 32%)`;
}

function dayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function GroupThreadView({
  currentUserId,
  isAdmin,
}: {
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<Map<string, MemberInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<{
    message: GroupMessage;
    mode: "unsend" | "admin-delete";
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const nameFor = useCallback(
    (id: string) => (id === currentUserId ? "You" : members.get(id)?.full_name || "Member"),
    [currentUserId, members]
  );
  const firstNameFor = useCallback(
    (id: string) => {
      const full = members.get(id)?.full_name;
      return full ? full.split(" ")[0] : "a member";
    },
    [members]
  );

  const loadRoom = useCallback(async () => {
    const supabase = createClient();
    const [{ data: msgs }, { data: allMembers }] = await Promise.all([
      supabase
        .from("group_messages")
        .select(GROUP_MESSAGE_COLUMNS)
        .order("created_at", { ascending: true })
        .limit(200),
      supabase.from("members").select("id, full_name, photo_url"),
    ]);

    setMessages(msgs || []);
    setMembers(
      new Map((allMembers || []).map((m) => [m.id, { full_name: m.full_name, photo_url: m.photo_url }]))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Only auto-scroll on genuine new messages, not on in-place edits/unsends
  // of older messages elsewhere in the room.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length > prevCountRef.current) {
      el.scrollTop = el.scrollHeight;
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  // Keep the read cursor current while the room is open, not just once on
  // arrival - the generic badge system's own auto-mark-as-read only fires on
  // navigation (path change), so without this, messages that arrive while
  // someone is already sitting in the room would incorrectly still show as
  // "unread" the next time they check the inbox, even though they saw them.
  useEffect(() => {
    if (loading || messages.length === 0) return;
    const supabase = createClient();
    supabase
      .from("user_section_reads")
      .upsert(
        { user_id: currentUserId, section: "group-chat", last_read_at: new Date().toISOString() },
        { onConflict: "user_id,section" }
      )
      .then(() => {});
  }, [messages, loading, currentUserId]);

  // One shared, unfiltered realtime channel - everyone reads every message,
  // so (unlike the 1:1 thread) there's no per-recipient filter to scope
  // this to. Merging by id keeps this idempotent against the sender's own
  // optimistic update, which also echoes back through this same channel.
  useEffect(() => {
    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel("group-chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_messages" },
        (payload) => {
          const incoming = payload.new as GroupMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "group_messages" },
        (payload) => {
          const updated = payload.new as GroupMessage;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleSend() {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    setDraft("");
    const replyId = replyingTo?.id ?? null;
    setReplyingTo(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("group_messages")
      .insert({ sender_id: currentUserId, content, reply_to_id: replyId })
      .select(GROUP_MESSAGE_COLUMNS)
      .single();

    if (!error && data) {
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
    } else {
      toast.error("Could not send your message");
    }
    setSending(false);
  }

  async function handleEditSave(messageId: string) {
    const content = editDraft.trim();
    if (!content) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("edit_group_message", { p_message_id: messageId, p_new_content: content })
      .select(GROUP_MESSAGE_COLUMNS)
      .single();

    if (error || !data) {
      toast.error("Could not save your edit");
    } else {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? (data as GroupMessage) : m)));
      setEditingId(null);
      setEditDraft("");
    }
  }

  async function handleConfirmedDelete() {
    if (!confirmTarget) return;
    const { message, mode } = confirmTarget;
    setConfirmTarget(null);

    const supabase = createClient();
    const rpcName = mode === "admin-delete" ? "admin_delete_group_message" : "unsend_group_message";
    const { data, error } = await supabase
      .rpc(rpcName, { p_message_id: message.id })
      .select(GROUP_MESSAGE_COLUMNS)
      .single();

    if (error || !data) {
      toast.error(mode === "admin-delete" ? "Could not remove this message" : "Could not unsend this message");
    } else {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? (data as GroupMessage) : m)));
    }
  }

  function jumpToMessage(id: string) {
    const container = scrollRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-message-id="${id}"]`);
    if (container && target) {
      container.scrollTop =
        target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
      target.classList.add("ring-2", "ring-sb-gold");
      setTimeout(() => target.classList.remove("ring-2", "ring-sb-gold"), 1200);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-sb-cream-dark bg-white shadow-sm md:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sb-cream-dark bg-white px-3 py-3">
        <Link
          href="/dashboard/messages"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-sb-cream"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sb-gold/15 text-sb-gold-dark">
          <Users className="h-4 w-4" />
        </div>
        <div>
          <p className="font-heading text-base font-bold text-sb-green-dark">The Common Room</p>
          <p className="text-[11px] text-muted-foreground">Everyone in the association</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-sb-cream px-3 py-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sb-gold/15">
              <Users className="h-6 w-6 text-sb-gold-dark" />
            </div>
            <p className="text-sm text-muted-foreground">Be the first to say hello.</p>
          </div>
        ) : (
          <div>
            {messages.map((m, i) => {
              const isMine = m.sender_id === currentUserId;
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const isDeleted = !!m.deleted_at;
              const isEditing = editingId === m.id;
              const canAdminDelete = isAdmin && !isMine && !isDeleted;

              const sameDayAsPrev =
                prev && new Date(prev.created_at).toDateString() === new Date(m.created_at).toDateString();
              const showDaySeparator = !sameDayAsPrev;

              const isGroupedWithPrev = Boolean(
                prev && prev.sender_id === m.sender_id && sameDayAsPrev
              );
              const isGroupedWithNext = Boolean(
                next &&
                  next.sender_id === m.sender_id &&
                  new Date(next.created_at).toDateString() === new Date(m.created_at).toDateString()
              );

              const parent = m.reply_to_id ? messages.find((x) => x.id === m.reply_to_id) : undefined;
              const parentUnavailable = !!m.reply_to_id && (!parent || !!parent.deleted_at);

              const deletedText = isDeleted
                ? m.deleted_by
                  ? "This message was removed by an admin"
                  : isMine
                    ? "You deleted this message"
                    : `${firstNameFor(m.sender_id)} deleted this message`
                : null;

              const actionRow = !isDeleted && !isEditing && (
                <div className="flex items-center gap-0.5 pb-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(m)}
                    title="Reply"
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-white hover:text-sb-green"
                  >
                    <Reply className="h-3.5 w-3.5" />
                  </button>
                  {isMine && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(m.id);
                          setEditDraft(m.content || "");
                        }}
                        title="Edit"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-white hover:text-sb-green"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmTarget({ message: m, mode: "unsend" })}
                        title="Unsend"
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-white hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {canAdminDelete && (
                    <button
                      type="button"
                      onClick={() => setConfirmTarget({ message: m, mode: "admin-delete" })}
                      title="Remove for everyone (admin)"
                      className="rounded-full p-1.5 text-red-500/70 hover:bg-red-50 hover:text-red-600"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );

              return (
                <div key={m.id} data-message-id={m.id}>
                  {showDaySeparator && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                        {dayLabel(m.created_at)}
                      </span>
                    </div>
                  )}
                  {!isMine && !isGroupedWithPrev && (
                    <p
                      className="mt-3 mb-0.5 ml-1 text-[11px] font-semibold"
                      style={{ color: colorForSender(m.sender_id) }}
                    >
                      {nameFor(m.sender_id)}
                    </p>
                  )}
                  <div
                    className={cn(
                      "group flex items-end gap-1",
                      isMine ? "justify-end" : "justify-start",
                      isGroupedWithPrev ? "mt-1" : isMine ? "mt-3" : "mt-0.5"
                    )}
                  >
                    {isMine && actionRow}
                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-2 text-sm shadow-sm transition-shadow",
                        isMine
                          ? "rounded-l-2xl rounded-tr-2xl border border-sb-gold/50 bg-sb-cream-dark text-sb-green-dark"
                          : "rounded-r-2xl rounded-tl-2xl bg-white text-sb-green-dark"
                      )}
                    >
                      {isDeleted ? (
                        <p className="italic text-muted-foreground">{deletedText}</p>
                      ) : isEditing ? (
                        <div className="flex flex-col gap-1.5">
                          <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={2}
                            autoFocus
                            className={cn(
                              "w-full resize-none rounded-lg border px-2 py-1 text-sm text-sb-green-dark outline-none",
                              isMine
                                ? "border-sb-gold/40 bg-white"
                                : "border-sb-cream-dark bg-sb-cream"
                            )}
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditDraft("");
                              }}
                              className="rounded-full p-1 hover:bg-sb-cream-dark"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditSave(m.id)}
                              className="rounded-full p-1 hover:bg-sb-cream-dark"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {m.reply_to_id && (
                            <button
                              type="button"
                              onClick={() => !parentUnavailable && jumpToMessage(m.reply_to_id!)}
                              className={cn(
                                "mb-1 block w-full rounded-lg border-l-2 border-sb-gold px-2 py-1 text-left text-xs",
                                isMine ? "bg-white" : "bg-sb-cream-dark"
                              )}
                            >
                              {parentUnavailable ? (
                                <span className="text-sb-green-dark/70">Original message unavailable</span>
                              ) : (
                                <>
                                  <span className="font-semibold text-sb-gold-dark">{nameFor(parent!.sender_id)}</span>
                                  {": "}
                                  <span className="line-clamp-1 text-sb-green-dark/70">{parent!.content}</span>
                                </>
                              )}
                            </button>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </>
                      )}
                      {!isGroupedWithNext && (
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                          {m.edited_at && !isDeleted && <span className="italic">edited</span>}
                          <span>
                            {new Date(m.created_at).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                    {!isMine && actionRow}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply preview bar */}
      {replyingTo && (
        <div className="flex items-center gap-2 border-t border-sb-cream-dark bg-sb-cream/70 px-3 py-2">
          <div className="h-8 w-0.5 shrink-0 rounded-full bg-sb-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-sb-green-dark">
              Replying to {nameFor(replyingTo.sender_id)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {replyingTo.deleted_at ? "Message unavailable" : replyingTo.content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-sb-cream-dark"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="flex gap-2 border-t border-sb-cream-dark bg-white px-3 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message The Common Room..."
          className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <Button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="rounded-full bg-sb-green text-white hover:bg-sb-green-light"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmTarget?.mode === "admin-delete" ? "Remove this message?" : "Unsend this message?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmTarget?.mode === "admin-delete"
                ? "This removes the message for everyone in The Common Room. This can't be undone."
                : "This removes the message for everyone in The Common Room. This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmedDelete}>
              {confirmTarget?.mode === "admin-delete" ? "Remove" : "Unsend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
