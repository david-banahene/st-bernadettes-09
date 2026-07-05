"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Users,
  CalendarDays,
  MessageCircle,
  MessageSquare,
  Heart,
  Megaphone,
  BookOpen,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useBadgeNotifications } from "@/hooks/use-badge-notifications";
import { useUnreadMessages } from "@/hooks/use-unread-messages";

type Props = {
  memberName: string;
  memberRole: string;
  memberPhoto: string | null;
  memberStatus: string;
};

// All navigation links
const memberLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/members", icon: Users, label: "Members" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/questions", icon: MessageCircle, label: "Questions" },
  { href: "/dashboard/welfare", icon: Heart, label: "Welfare" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/dashboard/minutes", icon: BookOpen, label: "Minutes" },
];

const leaderLinks = [
  { href: "/dashboard/admin", icon: Shield, label: "Admin Panel" },
];

// Bottom tab bar items (4 primary + More)
const bottomTabs = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
  { href: "/dashboard/members", icon: Users, label: "Members" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "News" },
];

// Items that go inside the "More" sheet
const moreLinks = [
  { href: "/dashboard/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/questions", icon: MessageCircle, label: "Questions" },
  { href: "/dashboard/welfare", icon: Heart, label: "Welfare" },
  { href: "/dashboard/minutes", icon: BookOpen, label: "Minutes" },
];

export function DashboardSidebar({
  memberName,
  memberRole,
  memberPhoto,
  memberStatus,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const showAdminLinks = memberRole === "leader" || memberRole === "admin";

  // Notification badge dots
  const { hasBadge, hasMoreBadge } = useBadgeNotifications(pathname);
  // Messages badges come from actual unread message counts, not the
  // generic content_updates system (which assumes shared, not private, content)
  const { unreadCount } = useUnreadMessages(pathname);
  const showDot = (href: string) =>
    href === "/dashboard/messages" ? unreadCount > 0 : hasBadge(href);

  // Close "More" sheet when navigating
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Prevent body scroll when More sheet is open
  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [moreOpen]);

  const initials = memberName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Check if current page is one of the "More" pages (to highlight More tab)
  const isMorePage =
    moreLinks.some((l) => pathname === l.href) ||
    (showAdminLinks && pathname.startsWith("/dashboard/admin"));

  return (
    <>
      {/* ========== MOBILE: Bottom Tab Bar ========== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sb-green-dark shadow-[0_-2px_10px_rgba(0,0,0,0.15)] md:hidden">
        {/* Safe area padding for phones with bottom notches */}
        <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
          {bottomTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex min-w-[64px] flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-all duration-200 active:scale-95",
                  isActive
                    ? "font-semibold text-sb-gold"
                    : "text-sb-cream/70"
                )}
              >
                <span
                  className={cn(
                    "relative flex items-center justify-center rounded-full px-4 py-1 transition-colors duration-200",
                    isActive && "bg-sb-gold/15"
                  )}
                >
                  <tab.icon
                    className={cn(
                      "h-6 w-6",
                      isActive && "stroke-[2.5]"
                    )}
                  />
                  {/* Notification badge dot */}
                  {hasBadge(tab.href) && (
                    <span className="absolute -top-0.5 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sb-green-dark" />
                  )}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-w-[64px] flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-all duration-200 active:scale-95",
              isMorePage
                ? "font-semibold text-sb-gold"
                : "text-sb-cream/70"
            )}
          >
            <span
              className={cn(
                "relative flex items-center justify-center rounded-full px-4 py-1 transition-colors duration-200",
                isMorePage && "bg-sb-gold/15"
              )}
            >
              <MoreHorizontal
                className={cn(
                  "h-6 w-6",
                  isMorePage && "stroke-[2.5]"
                )}
              />
              {/* Badge dot if any "More" section has new content */}
              {(hasMoreBadge() || unreadCount > 0) && (
                <span className="absolute -top-0.5 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sb-green-dark" />
              )}
            </span>
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ========== MOBILE: "More" Bottom Sheet ========== */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoreOpen(false)}
          />
          {/* Bottom sheet */}
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-xl animate-in slide-in-from-bottom duration-200">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-sb-cream-dark" />
            </div>

            {/* Profile header */}
            <div className="flex items-center gap-3 border-b border-sb-cream-dark px-5 pb-4 pt-2">
              <Avatar className="h-10 w-10 border border-sb-gold/30">
                {memberPhoto && (
                  <AvatarImage src={memberPhoto} alt={memberName} />
                )}
                <AvatarFallback className="bg-sb-green text-xs font-semibold text-sb-gold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-sb-green-dark">
                  {memberName}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-0.5 bg-sb-cream text-[10px] capitalize text-sb-green"
                >
                  {memberRole}
                </Badge>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sb-cream"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* More links */}
            <div className="px-3 py-2">
              {moreLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={cn(
                        "flex items-center gap-4 rounded-lg px-3 py-3 text-sm transition-colors",
                        isActive
                          ? "bg-sb-green/10 font-medium text-sb-green"
                          : "text-sb-green-dark hover:bg-sb-cream"
                      )}
                    >
                      <div className="relative">
                        <link.icon className="h-5 w-5 shrink-0" />
                        {showDot(link.href) && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </div>
                      <span className="flex-1">{link.label}</span>
                      {showDot(link.href) && (
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Admin link */}
              {showAdminLinks && (
                <>
                  <div className="my-1 border-t border-sb-cream-dark" />
                  {leaderLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link key={link.href} href={link.href}>
                        <div
                          className={cn(
                            "flex items-center gap-4 rounded-lg px-3 py-3 text-sm transition-colors",
                            isActive
                              ? "bg-sb-gold/10 font-medium text-sb-gold-dark"
                              : "text-sb-green-dark hover:bg-sb-cream"
                          )}
                        >
                          <link.icon className="h-5 w-5 shrink-0" />
                          <span>{link.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Log out */}
              <div className="mt-1 border-t border-sb-cream-dark pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== DESKTOP: Side panel (unchanged) ========== */}
      <aside
        className={cn(
          "hidden border-r border-sb-cream-dark bg-white transition-all duration-300 md:flex md:flex-col",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Profile */}
        <div className="border-b border-sb-cream-dark p-4">
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9 shrink-0 border border-sb-gold/30">
              {memberPhoto && (
                <AvatarImage src={memberPhoto} alt={memberName} />
              )}
              <AvatarFallback className="bg-sb-green text-xs font-semibold text-sb-gold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sb-green-dark">
                  {memberName}
                </p>
                <Badge
                  variant="secondary"
                  className="mt-0.5 bg-sb-cream text-[10px] capitalize text-sb-green"
                >
                  {memberRole}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-0.5">
            {memberLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sb-green/10 font-medium text-sb-green"
                        : "text-muted-foreground hover:bg-sb-cream hover:text-sb-green-dark",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <div className="relative">
                      <link.icon className="h-4 w-4 shrink-0" />
                      {showDot(link.href) && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </div>
                    {!collapsed && <span>{link.label}</span>}
                  </div>
                </Link>
              );
            })}

            {showAdminLinks && (
              <>
                <div className="my-2 border-t border-sb-cream-dark" />
                {leaderLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-sb-gold/10 font-medium text-sb-gold-dark"
                            : "text-muted-foreground hover:bg-sb-cream hover:text-sb-green-dark",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <link.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{link.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-sb-cream-dark p-2">
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 flex w-full items-center justify-center rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-sb-cream"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
