"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Users,
  CalendarDays,
  MessageCircle,
  Heart,
  Megaphone,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

type Props = {
  memberName: string;
  memberRole: string;
  memberPhoto: string | null;
  memberStatus: string;
};

const memberLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/profile", icon: User, label: "My Profile" },
  { href: "/dashboard/members", icon: Users, label: "Members" },
  { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
  { href: "/dashboard/questions", icon: MessageCircle, label: "Questions" },
  { href: "/dashboard/welfare", icon: Heart, label: "Welfare" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/dashboard/minutes", icon: BookOpen, label: "Minutes" },
];

const leaderLinks = [
  { href: "/dashboard/admin", icon: Shield, label: "Admin Panel" },
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

  const showAdminLinks = memberRole === "leader" || memberRole === "admin";

  return (
    <aside
      className={cn(
        "hidden border-r border-sb-cream-dark bg-white transition-all duration-300 md:flex md:flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Profile */}
      <div className="border-b border-sb-cream-dark p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-9 w-9 shrink-0 border border-sb-gold/30">
            {memberPhoto && <AvatarImage src={memberPhoto} alt={memberName} />}
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
                  <link.icon className="h-4 w-4 shrink-0" />
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
  );
}
