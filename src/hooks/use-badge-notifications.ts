"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type BadgeSection =
  | "events"
  | "announcements"
  | "questions"
  | "welfare"
  | "admin"
  | "minutes"
  | "members"
  | "group-chat";

const sectionPaths: Record<BadgeSection, string> = {
  events: "/dashboard/events",
  announcements: "/dashboard/announcements",
  questions: "/dashboard/questions",
  welfare: "/dashboard/welfare",
  admin: "/dashboard/admin",
  minutes: "/dashboard/minutes",
  members: "/dashboard/members",
  "group-chat": "/dashboard/messages/group",
};

const pathToSection: Record<string, BadgeSection> = Object.fromEntries(
  Object.entries(sectionPaths).map(([section, path]) => [path, section as BadgeSection])
);

const POLL_INTERVAL = 30_000;

export function useBadgeNotifications(currentPath: string) {
  const [badges, setBadges] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBadges = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: updates, error: updatesError } = await supabase
      .from("content_updates")
      .select("section, last_updated_at");

    if (updatesError) {
      console.error("[badges] Failed to fetch content_updates:", updatesError.message);
      return;
    }

    const { data: reads, error: readsError } = await supabase
      .from("user_section_reads")
      .select("section, last_read_at")
      .eq("user_id", user.id);

    if (readsError) {
      console.error("[badges] Failed to fetch user_section_reads:", readsError.message);
    }

    if (!updates || updates.length === 0) {
      console.warn("[badges] content_updates table is empty or missing");
      return;
    }

    const readMap = new Map(
      (reads || []).map((r) => [r.section, new Date(r.last_read_at)])
    );

    const newBadges: Record<string, boolean> = {};
    for (const update of updates) {
      const lastRead = readMap.get(update.section);
      const lastUpdated = new Date(update.last_updated_at);
      newBadges[update.section] = !lastRead || lastUpdated > lastRead;
    }

    setBadges(newBadges);

    // Update PWA home screen badge count
    const unreadCount = Object.values(newBadges).filter(Boolean).length;
    if ("setAppBadge" in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, []);

  const markAsRead = useCallback(async (section: BadgeSection) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("user_section_reads").upsert(
      {
        user_id: user.id,
        section,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,section" }
    );

    if (error) {
      console.error("[badges] Failed to mark as read:", error.message);
      return;
    }

    setBadges((prev) => ({ ...prev, [section]: false }));
  }, []);

  // Auto-mark current page as read
  useEffect(() => {
    const section = pathToSection[currentPath];
    if (section) {
      markAsRead(section);
    }
  }, [currentPath, markAsRead]);

  // Fetch on mount and path change
  useEffect(() => {
    fetchBadges();
  }, [currentPath, fetchBadges]);

  // Poll every 30 seconds for new content
  useEffect(() => {
    intervalRef.current = setInterval(fetchBadges, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBadges]);

  // Instant refresh on new group chat messages - a hardcoded one-off for
  // this single section, not a generalization of the badge system into
  // "realtime for every section" (Announcements/Events etc keep polling
  // exactly as before). Worth it here specifically because instant delivery
  // is this feature's whole pitch - a 30s-stale nav dot would visibly
  // undercut that.
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      channel = supabase
        .channel(`group-chat-badge-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "group_messages" },
          () => fetchBadges()
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchBadges]);

  // Refetch when browser tab becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchBadges();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchBadges]);

  const hasBadge = useCallback(
    (path: string): boolean => {
      const section = pathToSection[path];
      return section ? badges[section] === true : false;
    },
    [badges]
  );

  const hasMoreBadge = useCallback((): boolean => {
    return (
      badges["questions"] === true ||
      badges["welfare"] === true ||
      badges["admin"] === true ||
      badges["minutes"] === true
    );
  }, [badges]);

  return { badges, hasBadge, hasMoreBadge, fetchBadges, markAsRead };
}
