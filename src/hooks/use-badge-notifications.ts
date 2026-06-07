"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// Sections that can show notification badges
export type BadgeSection =
  | "events"
  | "announcements"
  | "questions"
  | "welfare"
  | "admin";

// Maps sections to their page paths
const sectionPaths: Record<BadgeSection, string> = {
  events: "/dashboard/events",
  announcements: "/dashboard/announcements",
  questions: "/dashboard/questions",
  welfare: "/dashboard/welfare",
  admin: "/dashboard/admin",
};

// Maps page paths back to sections (for auto-marking as read)
const pathToSection: Record<string, BadgeSection> = Object.fromEntries(
  Object.entries(sectionPaths).map(([section, path]) => [path, section as BadgeSection])
);

export function useBadgeNotifications(currentPath: string) {
  const [badges, setBadges] = useState<Record<string, boolean>>({});

  // Fetch badge states: compare content_updates vs user_section_reads
  const fetchBadges = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get all section update timestamps
    const { data: updates } = await supabase
      .from("content_updates")
      .select("section, last_updated_at");

    // Get this user's read timestamps
    const { data: reads } = await supabase
      .from("user_section_reads")
      .select("section, last_read_at")
      .eq("user_id", user.id);

    if (!updates) return;

    const readMap = new Map(
      (reads || []).map((r) => [r.section, new Date(r.last_read_at)])
    );

    const newBadges: Record<string, boolean> = {};
    for (const update of updates) {
      const lastRead = readMap.get(update.section);
      const lastUpdated = new Date(update.last_updated_at);
      // Show badge if user has never visited OR new content since last visit
      newBadges[update.section] = !lastRead || lastUpdated > lastRead;
    }

    setBadges(newBadges);
  }, []);

  // Mark a section as read (called when user visits a page)
  const markAsRead = useCallback(async (section: BadgeSection) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("user_section_reads").upsert(
      {
        user_id: user.id,
        section,
        last_read_at: new Date().toISOString(),
      },
      { onConflict: "user_id,section" }
    );

    // Clear the badge locally immediately
    setBadges((prev) => ({ ...prev, [section]: false }));
  }, []);

  // Auto-mark current page as read when path changes
  useEffect(() => {
    const section = pathToSection[currentPath];
    if (section) {
      markAsRead(section);
    }
  }, [currentPath, markAsRead]);

  // Fetch badges on mount and when path changes
  useEffect(() => {
    fetchBadges();
  }, [currentPath, fetchBadges]);

  // Check if a specific path has a badge
  const hasBadge = useCallback(
    (path: string): boolean => {
      const section = pathToSection[path];
      return section ? badges[section] === true : false;
    },
    [badges]
  );

  // Check if any "More" page has a badge
  const hasMoreBadge = useCallback((): boolean => {
    return (
      badges["questions"] === true ||
      badges["welfare"] === true ||
      badges["admin"] === true
    );
  }, [badges]);

  return { badges, hasBadge, hasMoreBadge, fetchBadges, markAsRead };
}
