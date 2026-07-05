import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users } from "lucide-react";

interface RawMessage {
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const myId = user!.id;

  // Fetch this user's messages (either side of the conversation), newest first
  const { data: messages } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, content, read_at, created_at")
    .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
    .order("created_at", { ascending: false })
    .limit(500);

  // Group messages by "the other participant" - no conversations table needed
  // at this scale, since it's just a small fetch grouped in JS.
  const conversations = new Map<
    string,
    { lastMessage: string; lastAt: string; unread: number }
  >();

  for (const m of (messages as RawMessage[]) || []) {
    const otherId = m.sender_id === myId ? m.recipient_id : m.sender_id;
    const isUnread = m.recipient_id === myId && !m.read_at;
    const existing = conversations.get(otherId);
    if (!existing) {
      conversations.set(otherId, {
        lastMessage: m.content,
        lastAt: m.created_at,
        unread: isUnread ? 1 : 0,
      });
    } else if (isUnread) {
      existing.unread += 1;
    }
  }

  const otherIds = Array.from(conversations.keys());

  const { data: otherMembers } = otherIds.length
    ? await supabase
        .from("members")
        .select("id, full_name, photo_url")
        .in("id", otherIds)
    : { data: [] };

  const memberMap = new Map((otherMembers || []).map((m) => [m.id, m]));

  // The Common Room preview: last message + unread flag computed from the
  // generic content_updates/user_section_reads badge system (a group room's
  // "anything new since I last looked" is a single shared timestamp, not a
  // per-recipient count like private DMs).
  const [{ data: lastGroupMsgRaw }, { data: groupUpdate }, { data: groupRead }] = await Promise.all([
    supabase
      .from("group_messages")
      .select("content, created_at, sender:members!group_messages_sender_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("content_updates").select("last_updated_at").eq("section", "group-chat").maybeSingle(),
    supabase
      .from("user_section_reads")
      .select("last_read_at")
      .eq("user_id", myId)
      .eq("section", "group-chat")
      .maybeSingle(),
  ]);

  const lastGroupMsg = lastGroupMsgRaw as unknown as
    | { content: string | null; created_at: string; sender: { full_name: string } | null }
    | null;

  const groupHasUnread =
    !!groupUpdate &&
    (!groupRead || new Date(groupUpdate.last_updated_at) > new Date(groupRead.last_read_at));

  const inbox = otherIds
    .map((id) => ({
      id,
      name: memberMap.get(id)?.full_name || "Member",
      photo: memberMap.get(id)?.photo_url || null,
      ...conversations.get(id)!,
    }))
    .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sb-green/8 text-sb-green">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-sb-green-dark">
            Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Private chats with other members
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/dashboard/messages/group">
          <Card className="border-sb-gold/30 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-sb-gold/50 hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-3.5">
              <Avatar className="h-12 w-12 shrink-0 border border-sb-gold/30 bg-sb-gold/15">
                <AvatarFallback className="bg-sb-gold/15 text-sb-gold-dark">
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm text-sb-green-dark",
                      groupHasUnread ? "font-bold" : "font-semibold"
                    )}
                  >
                    The Common Room
                  </p>
                  {lastGroupMsg && (
                    <span
                      className={cn(
                        "shrink-0 text-[11px]",
                        groupHasUnread ? "font-semibold text-sb-green" : "text-muted-foreground"
                      )}
                    >
                      {relativeTime(lastGroupMsg.created_at)}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-xs",
                      groupHasUnread ? "font-medium text-sb-green-dark" : "text-muted-foreground"
                    )}
                  >
                    {lastGroupMsg
                      ? `${lastGroupMsg.sender?.full_name?.split(" ")[0] || "Member"}: ${lastGroupMsg.content || "Message removed"}`
                      : "Be the first to say hello"}
                  </p>
                  {groupHasUnread && (
                    <Badge className="shrink-0 rounded-full bg-sb-gold px-1.5 py-0 text-[10px] leading-5 text-sb-green-dark">
                      New
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {inbox.length === 0 ? (
        <Card className="mt-3 border-sb-cream-dark bg-white">
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sb-green/8">
              <MessageSquare className="h-6 w-6 text-sb-green" />
            </div>
            <p className="text-sm text-muted-foreground">
              No conversations yet. Start one from the Members directory.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-3 space-y-1.5">
          {inbox.map((c) => {
            const initials = c.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const hasUnread = c.unread > 0;
            return (
              <Link key={c.id} href={`/dashboard/messages/${c.id}`}>
                <Card className="border-sb-cream-dark bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-sb-gold/30 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 py-3.5">
                    <Avatar className="h-12 w-12 shrink-0 border border-sb-gold/20">
                      {c.photo && <AvatarImage src={c.photo} alt={c.name} />}
                      <AvatarFallback className="bg-sb-green text-sm font-semibold text-sb-gold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm text-sb-green-dark",
                            hasUnread ? "font-bold" : "font-semibold"
                          )}
                        >
                          {c.name}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 text-[11px]",
                            hasUnread ? "font-semibold text-sb-green" : "text-muted-foreground"
                          )}
                        >
                          {relativeTime(c.lastAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-xs",
                            hasUnread ? "font-medium text-sb-green-dark" : "text-muted-foreground"
                          )}
                        >
                          {c.lastMessage}
                        </p>
                        {hasUnread && (
                          <Badge className="shrink-0 rounded-full bg-sb-green px-1.5 py-0 text-[10px] leading-5 text-white">
                            {c.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
