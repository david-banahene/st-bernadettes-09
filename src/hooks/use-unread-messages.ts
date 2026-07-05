"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Unread message counts are computed directly from the messages table
// (recipient_id = me, read_at is null) rather than reusing the generic
// content_updates/user_section_reads badge system, since that system
// assumes one shared "last updated" timestamp per section - wrong for
// private messages between other people.
export function useUnreadMessages(currentPath: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null);

    setUnreadCount(count || 0);
  }, []);

  // Refetch on mount and whenever the route changes (e.g. after reading a thread)
  useEffect(() => {
    fetchUnreadCount();
  }, [currentPath, fetchUnreadCount]);

  // Live updates: refetch whenever a new message arrives for this user
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;
    // Guards against React Strict Mode's mount->cleanup->remount cycle: the
    // channel is only created after an async getUser() call, so without this
    // flag, the first mount's cleanup can fire before that await resolves,
    // leaving nothing to remove and letting the second mount collide with
    // it under the same channel name ("cannot add postgres_changes
    // callbacks... after subscribe()").
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      channel = supabase
        .channel(`unread-messages-badge-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `recipient_id=eq.${user.id}`,
          },
          () => fetchUnreadCount()
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchUnreadCount]);

  // Refetch when the tab regains focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchUnreadCount();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchUnreadCount]);

  return { unreadCount };
}
