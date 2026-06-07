# Knowledge Notes - Web Development Learnings
# From the St. Bernadette's '09 Association Web App Project
# Reusable knowledge for future projects
# Started: June 2026

---

## 1. Mobile Navigation: Bottom Tab Bar vs Hamburger Menu

**What we learned:** Hiding navigation behind a hamburger menu causes members
to miss features. Studies show 30-50% lower feature discovery with hamburger
menus compared to visible bottom tab bars.

**Key stats:**
- Bottom tab bars: 40% faster task completion (Airbnb user testing)
- 30%+ increase in sessions per user when switching from hamburger to tab bar
- Hamburger menus are "out of sight, out of mind"

**Best practice:**
- Use 3-5 tabs in the bottom bar (never more than 5)
- If you have more pages, use a "More" tab that opens a bottom sheet
- Icons should be 24px with text labels below (never icons alone)
- Active tab: bolder icon + brand color + darker text
- Minimum tap target: 44x44 CSS pixels
- Add safe area padding for phones with notches: `pb-[env(safe-area-inset-bottom)]`

**Pattern we used:**
- 4 primary tabs (Home, Events, Members, News) always visible
- "More" tab opens bottom sheet with remaining pages
- Desktop keeps the full sidebar - bottom bar is mobile only

**Sources:**
- UX Planet: https://uxplanet.org/bottom-tab-bar-design-best-practices-ef3ee71de0fc
- Smashing Magazine: https://www.smashingmagazine.com/2016/11/the-golden-rules-of-mobile-navigation-design/
- UXPin: https://www.uxpin.com/studio/blog/mobile-navigation-examples/

---

## 2. Email Notifications: Less is More

**What we learned:** Sending emails for every action burns through free tier
limits and annoys users. Only send emails for things the person is waiting
for or that require their attention.

**Essential notifications (keep):**
- Member approved (one-time, they need to know they can log in)
- Question answered (they are waiting for a response)
- Welfare decision (urgent, personal - bereavement/sickness)
- Payment confirmed (peace of mind their money was received)

**Non-essential notifications (removed):**
- New event created (use WhatsApp share instead - bulk = 50 emails)
- New announcement (use WhatsApp share instead - bulk = 50 emails)
- Dues confirmed (low stakes, visible in the app)

**Rule of thumb:** If the same info is accessible by opening the app or
can be shared via WhatsApp group, do not send an email for it. Save emails
for personal, time-sensitive, or action-required notifications.

**Resend free tier:** 100 emails/day. With ~50 members, one bulk send
uses the entire daily limit.

---

## 3. Phone Input with Country Codes

**What we learned:** For international groups, a plain phone input with
a placeholder like "+233" is not enough. Members in different countries
need a proper country code selector.

**Implementation pattern:**
- Dropdown showing flag emoji + dial code + country name
- Separate the dropdown (country code) from the text input (local number)
- Store the full international number (e.g., +233241234567)
- Default to the most common country (Ghana in our case)
- Put the most relevant countries at the top of the list
- Use a hidden input to combine code + number for form submission
- When editing, parse the existing number to auto-select the country

**Reusable component:** `src/components/phone-input.tsx`

---

## 4. Profile Photo: Make It Required

**What we learned:** Optional photo uploads mean most members will skip it.
This makes the member directory look incomplete and forces a "complete your
profile" prompt on the dashboard.

**Fix:** Make photo upload required at registration with both:
- HTML `required` attribute on the file input
- JavaScript validation in the submit handler as a backup

---

## 5. Deployment: Vercel + Supabase Stack

**What we learned:**
- Vercel Hobby plan (free) works for small apps - auto-deploys on git push
- Supabase free tier: generous for ~50 member associations
- Resend free tier: 100 emails/day, sends from onboarding@resend.dev
- GitHub repo must be public for Vercel Hobby plan (private requires Pro)
- Environment variables: set once in Vercel dashboard, persist across deploys
- Supabase URL Configuration: must add both localhost AND production URLs

**Domain naming:** Avoid ".app" at the end of URLs. Short, natural names
work best (e.g., sbfamily.vercel.app instead of stbernadettes09app.vercel.app)

---

## 6. Next.js Production Build Gotchas

**useSearchParams() requires Suspense:**
In Next.js 16+ production builds, any page using `useSearchParams()` must be
wrapped in a `<Suspense>` boundary. Works fine in dev but fails static
generation in production.

```tsx
export default function Page() {
  return (
    <Suspense>
      <ActualComponent />
    </Suspense>
  );
}
```

**Build cache can go stale:**
After deleting files (API routes, pages), the `.next` folder may still
reference them. Fix: `Remove-Item -Recurse -Force .next` before building.

---

## 7. Supabase RLS (Row Level Security)

**What we learned:** RLS policies control who can read/update/delete data.
A missing policy = the action silently fails with no error message.

**Common gotcha:** A policy like `id = auth.uid()` lets members update
their own record but blocks admin from updating other members. Fix: add
a separate policy for admin:

```sql
create policy "Admin can update any member"
  on public.members for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role = 'admin')
  );
```

**Rule:** Always test admin actions after adding RLS policies. If a button
"does nothing" in production, it is almost always a missing RLS policy.

---

## 8. Client Components Cannot Call Server-Side Libraries

**What we learned:** Email sending (Resend) requires a server-side API key.
Client components (pages with "use client") cannot call Resend directly.

**Solution: API routes as a bridge**
1. Create an API route: `src/app/api/email/[action]/route.ts`
2. The API route verifies the caller's auth and role
3. The API route calls the email library (server-side)
4. The client component calls `fetch("/api/email/[action]")`
5. Wrap in try/catch so email failure never blocks the main action

**Pattern:**
```tsx
// Client component
try {
  await fetch("/api/email/member-approved", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId }),
  });
} catch {
  // Email failure should not block the action
}
```

---

## 9. PWA (Progressive Web App) Setup

**What we learned:** Adding a manifest.json + icons makes the site
installable on phone home screens. Members can "Add to Home Screen"
and it opens like a native app.

**Required files:**
- `public/manifest.json` (app name, colors, icons, start_url)
- `public/icons/icon-192.svg` and `icon-512.svg`
- Head tags in layout: manifest link, theme-color meta, apple-touch-icon

**Key settings:**
- `display: "standalone"` makes it look like a native app (no browser chrome)
- `start_url: "/dashboard"` opens directly to the dashboard
- `theme_color` matches the brand (SB green #1B4332)

---

## 10. Tools & Services Used

| Tool | Purpose | Cost | Notes |
|------|---------|------|-------|
| Next.js 16 | Framework | Free | App Router, TypeScript, Turbopack |
| Tailwind CSS v4 | Styling | Free | With shadcn/ui components |
| Supabase | Database + Auth + Storage | Free tier | PostgreSQL, RLS, PKCE auth |
| Resend | Email notifications | Free (100/day) | Branded HTML templates |
| Vercel | Hosting + deployment | Free (Hobby) | Auto-deploy from GitHub |
| GitHub | Code repository | Free | Public repo for Vercel Hobby |
| Git | Version control | Free | Pre-installed on Windows |

---

## 11. Ghana-Specific Considerations

- All event times display in Africa/Accra timezone with "(Ghana)" label
- Currency: GHS (Ghana Cedis) for all payment amounts
- MoMo (Mobile Money) is the primary payment method, not credit cards
- MTN MoMo is the dominant network
- Most members access on mobile phones, not desktop
- WhatsApp is the primary communication channel for the group

---

## 12. Skeleton Loading Screens (Perceived Performance)

**What we learned:** Users perceive speed based on feedback, not actual load
time. A page that shows a skeleton animation in 100ms and fills data at 1.5s
feels faster than a page that shows nothing for 1.5s then appears fully loaded.

**Implementation in Next.js:**
- Create a `loading.tsx` file in each route folder
- Next.js automatically shows it while the page's server component loads
- No code changes needed in the actual pages
- Each skeleton should roughly match the layout of the real page

**Design rules for skeletons:**
- Use `animate-pulse` on placeholder divs
- Match the real page layout (cards, lists, headers)
- Use brand-neutral gray tones (`bg-sb-cream-dark`)
- Round corners to match the real components
- Never show a generic spinner - shaped skeletons feel faster

**Files added:**
- `src/app/dashboard/loading.tsx` (home)
- `src/app/dashboard/profile/loading.tsx`
- `src/app/dashboard/events/loading.tsx`
- `src/app/dashboard/members/loading.tsx`
- `src/app/dashboard/announcements/loading.tsx`
- `src/app/dashboard/questions/loading.tsx`
- `src/app/dashboard/welfare/loading.tsx`
- `src/app/dashboard/minutes/loading.tsx`
- `src/app/dashboard/admin/loading.tsx`

---

## 13. Bottom Tab Bar: Make It Unmissable

**What we learned:** A white bottom tab bar blends into the page content.
Members did not realize navigation was there. Research shows the single
highest-impact change is switching to a colored background.

**Premium pattern (Material Design 3 / Instagram / WhatsApp 2025-2026):**
- Dark brand-color background (our dark green #1B4332)
- Cream/white icons at 70% opacity for inactive tabs
- Gold pill-shaped highlight behind the active tab icon
- Shadow to lift the bar off the page: `shadow-[0_-2px_10px_rgba(0,0,0,0.15)]`
- Tap feedback: `active:scale-95 transition-all duration-200`
- Label size: at least 11px (10px is too small for readability)
- WCAG contrast: dark green on cream = 11:1 ratio (exceeds AAA)

**Sources:**
- Material Design 3: https://m3.material.io/components/navigation-bar/overview
- Mobbin Tab Bar Best Practices: https://mobbin.com/glossary/tab-bar

---

## 14. In-App Notification Badges (Red Dots)

**What we learned:** Without notification indicators, members have no way to
know something new happened unless they manually open every page. A simple
red dot on the tab icon solves this.

**Lightweight approach (timestamp comparison, not a full notifications table):**
- `content_updates` table: one row per section, stores last_updated_at
- `user_section_reads` table: one row per user per section, stores last_read_at
- Badge shows when last_updated_at > last_read_at
- Database triggers auto-bump content_updates when new rows are inserted
- Dot auto-clears when user visits the page (upsert their last_read_at)

**Visual design:**
- 10px red dot, positioned top-right of the icon
- White ring border for contrast: `ring-2 ring-white` (or ring-sb-green-dark on dark bg)
- Use dots, not count badges, for section-level indicators (~50 members)

**Why not a full notifications table:** For 50 members with moderate activity,
counts add clutter without value. The timestamp approach uses two tiny tables
instead of potentially thousands of notification rows.

**SQL file:** `supabase/create-notification-badges.sql`
**Hook:** `src/hooks/use-badge-notifications.ts`

---

## 15. Questions Page: Single List with Threading

**What we learned:** Splitting questions into "Pending" and "Answered" sections
forces users to scan two places. Slack's design team found that a single
chronological list with visual status indicators is more usable.

**Key changes:**
- One list sorted newest first (no Pending/Answered sections)
- Left border color codes status: green = answered, amber = pending
- Answer preview in collapsed state: "Leadership: Lets pay say 50 cedis..."
- Expanded view: answers indented with left border (`ml-4 pl-3 border-l-2`)
- Shield icon + name badge on responses to distinguish leadership replies
- Single accordion: only one card expanded at a time

**Sources:**
- Slack Design: https://slack.design/articles/threads-in-slack-a-long-design-journey-part-2-of-2/

---

## 16. Toast Notifications (Sonner)

**What we learned:** When a user performs an action (approve member, post
announcement, confirm payment), there should be instant visual feedback.
Without it, users click buttons multiple times or wonder if anything happened.

**Implementation:**
- Library: Sonner (shadcn/ui standard, under 5KB)
- Position: `top-center` with `richColors` prop
- Usage: `toast.success("Member approved")` or `toast.error("Failed")`
- Add to every action handler across the dashboard
- The `<Toaster>` component goes in the dashboard layout

**Rule:** Every user-triggered action should produce a toast. Success toasts
disappear automatically. Error toasts stay until dismissed.

**Component:** Already included with shadcn/ui at `src/components/ui/sonner.tsx`

---

## 17. Service Worker (Offline + Fast Repeat Loads)

**What we learned:** On slow mobile networks (common in Ghana), repeat visits
to the app felt slow because every asset was re-downloaded. A service worker
caches the app shell (JS, CSS, fonts) so repeat loads are instant.

**Strategy:**
- Cache-first for static assets (JS, CSS, fonts, images)
- Network-first for navigation (pages) with offline fallback
- Skip API calls and Supabase requests (always network)
- Pre-cache the offline fallback page on install
- `skipWaiting()` + `clients.claim()` for immediate activation

**Files:**
- `public/sw.js` (the service worker)
- `src/components/sw-register.tsx` (registers the SW on page load)
- `src/app/offline/page.tsx` (branded offline fallback page)

**Cache versioning:** Change `CACHE_NAME` when you need to bust the cache.
Old caches are automatically cleaned up on activation.

---

*Last updated: June 2026*
