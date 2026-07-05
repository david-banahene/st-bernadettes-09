"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
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

export function ThreadView({
  currentUserId,
  otherId,
  otherName,
  otherPhoto,
}: {
  currentUserId: string;
  otherId: string;
  otherName: string;
  otherPhoto: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadThread = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    setMessages(data || []);
    setLoading(false);
  }, [currentUserId, otherId]);

  const markAsRead = useCallback(async () => {
    const supabase = createClient();
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("sender_id", otherId)
      .eq("recipient_id", currentUserId)
      .is("read_at", null);
  }, [currentUserId, otherId]);

  useEffect(() => {
    loadThread();
    markAsRead();
  }, [loadThread, markAsRead]);

  // Scroll only the messages panel itself, never the outer page - scoping
  // this to the container's own scrollTop avoids scrollIntoView bubbling the
  // scroll up to ancestor containers (which was dragging the whole page down
  // to the site footer).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // One realtime subscription for messages sent to me; only ones from the
  // person in this thread get appended here (others just feed the nav badge).
  useEffect(() => {
    const supabase = createClient();
    const channel: RealtimeChannel = supabase
      .channel(`thread-${otherId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          if (incoming.sender_id === otherId) {
            setMessages((prev) => [...prev, incoming]);
            markAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherId, currentUserId, markAsRead]);

  async function handleSend() {
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    setDraft("");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        recipient_id: otherId,
        content,
      })
      .select("id, sender_id, recipient_id, content, created_at")
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
    }
    setSending(false);
  }

  const initials = otherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        <Avatar className="h-9 w-9 border border-sb-gold/20">
          {otherPhoto && <AvatarImage src={otherPhoto} alt={otherName} />}
          <AvatarFallback className="bg-sb-green text-xs font-semibold text-sb-gold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <p className="font-heading text-base font-bold text-sb-green-dark">
          {otherName}
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-sb-cream px-3 py-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-sb-green" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Avatar className="h-14 w-14 border border-sb-gold/20 opacity-80">
              {otherPhoto && <AvatarImage src={otherPhoto} alt={otherName} />}
              <AvatarFallback className="bg-sb-green text-sm font-semibold text-sb-gold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              Say hello to {otherName.split(" ")[0]}.
            </p>
          </div>
        ) : (
          <div>
            {messages.map((m, i) => {
              const isMine = m.sender_id === currentUserId;
              const prev = messages[i - 1];
              const next = messages[i + 1];

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

              return (
                <div key={m.id}>
                  {showDaySeparator && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                        {dayLabel(m.created_at)}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex",
                      isMine ? "justify-end" : "justify-start",
                      isGroupedWithPrev ? "mt-1" : "mt-3"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-2 text-sm shadow-sm",
                        // One consistent shape per message - a permanent
                        // sharp corner on the sender's trailing edge acts as
                        // the bubble "tail", the same convention used by
                        // WhatsApp/iMessage/Telegram (and shadcn's own chat
                        // components): sent bubbles stay square at
                        // bottom-right, received bubbles stay square at
                        // bottom-left, every time - no grouping logic needed.
                        isMine
                          ? "rounded-l-2xl rounded-tr-2xl bg-sb-green text-white"
                          : "rounded-r-2xl rounded-tl-2xl bg-white text-sb-green-dark"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {!isGroupedWithNext && (
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            isMine ? "text-white/60" : "text-muted-foreground"
                          )}
                        >
                          {new Date(m.created_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="flex gap-2 border-t border-sb-cream-dark bg-white px-3 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
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
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
