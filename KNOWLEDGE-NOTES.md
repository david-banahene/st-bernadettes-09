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

*Last updated: June 2026*
