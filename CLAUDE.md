# St. Bernadette's '09 Association - Web Application

## Project Owner
David Banahene (abanahene54@gmail.com) - PhD student in Public Health,
managing this project from the USA for the association based in Ghana.
This is David's first web development project. He has no web dev experience.
Take full technical lead. Explain decisions. Get approval before building.

## READ FIRST
Before doing anything, read:
1. This file completely
2. The full build plan at: BUILDPLAN.md
3. The constitution PDF at: public/constitution.pdf

---

## Current Status

### COMPLETED
- Phase 1: Project setup, all public pages (Home, About, Leaders, Events, Constitution)
- Design overhaul: Playfair Display + Inter fonts, Magic UI animations
  (Particles, BlurFade, ShimmerButton, NumberTicker), responsive on mobile/desktop

### COMPLETED: Phase 2 - Database & Authentication
- DONE: Supabase project created (st-bernadettes-09, eu-west-2 London)
- DONE: .env.local created with project URL and keys
- DONE: @supabase/supabase-js and @supabase/ssr installed
- DONE: Browser client (src/lib/supabase/client.ts)
- DONE: Server client (src/lib/supabase/server.ts)
- DONE: Middleware for session management (src/middleware.ts)
- DONE: All 11 database tables created via SQL in Supabase dashboard
- DONE: 20+ RLS security policies created
- DONE: 4 storage buckets created (member-photos, event-photos, event-covers, meeting-minutes)
- DONE: Registration form with photo upload (src/app/register/page.tsx)
- DONE: Login page (src/app/login/page.tsx)
- DONE: Dashboard layout with sidebar (src/app/dashboard/layout.tsx)
- DONE: Dashboard sidebar component (src/components/dashboard-sidebar.tsx)
- DONE: Dashboard home page with live stats cards (src/app/dashboard/page.tsx)
- DONE: Supabase Storage buckets created via SQL
- DONE: Auth callback route with token_hash + PKCE support (src/app/auth/callback/route.ts)
- DONE: register_member RPC function created in Supabase (SECURITY DEFINER, bypasses RLS)
- DONE: Registration redirects straight to dashboard (no intermediate success screen)
- DONE: Navbar is auth-aware (shows Dashboard/Sign Out when logged in, Log In/Register when not)
- DONE: Members count on dashboard pulls live data from database
- DONE: Registration + login + dashboard flow tested and verified working
- DONE: Test account (banahene91@gmail.com) set to role=admin, membership_status=active via Table Editor
- DONE: Admin Panel link appears in sidebar for admin users
- NOTE: Email confirmation disabled for development (re-enable with Resend SMTP in Phase 8)
- NOTE: Supabase URL Configuration: Site URL = http://localhost:3000, Redirect URL = http://localhost:3000/**
        (Change both to production domain when deploying in Phase 9)
- NOTE: Role/member approval is manual via Supabase Table Editor until Phase 7 Admin Panel is built

### COMPLETED: Phase 3 - Member Features
- DONE: Profile page with view/edit mode, photo upload, Good Standing badge (src/app/dashboard/profile/page.tsx)
- DONE: Member directory with search, role badges, status indicators (src/app/dashboard/members/page.tsx)
- DONE: Member detail slide-out panel for leaders/admin with full contact info (member-detail-panel.tsx)
- DONE: Client-side member search component (member-search.tsx)
- DONE: Dashboard birthday celebrants card (shows members with birthdays this month)
- DONE: Dashboard profile completion prompt (links to profile page when photo/DOB missing)
- DONE: All pages tested and verified working

### COMPLETED: Phase 4 - Events System + MoMo Payment Tracking
- DONE: Event creation form for leaders/admin (src/app/dashboard/admin/events/page.tsx)
  - Fields: title, description, event type select, location, start/end datetime, payment amount (optional), cover image upload
  - Auth check: only leader/admin role can access
  - Uploads cover image to event-covers storage bucket
- DONE: Events listing page (src/app/dashboard/events/page.tsx)
  - Server component, splits events into upcoming vs past
  - Shows event type badges, date/time/location, payment amount, cover image thumbnails
  - "Create Event" button visible only for leaders/admin
- DONE: Live countdown timer component (src/app/dashboard/events/event-countdown.tsx)
  - Client component, updates every 60 seconds
  - Shows days/hours/minutes remaining
- DONE: Event detail page (src/app/dashboard/events/[id]/page.tsx)
  - Full cover image, event type badge, countdown, date/time/location cards
  - WhatsApp share button, MoMo payment section, photo gallery
- DONE: WhatsApp share (src/app/dashboard/events/[id]/event-whatsapp-share.tsx)
  - Formats event details as WhatsApp message with title, date, time, location, fee
- DONE: MoMo payment tracking (src/app/dashboard/events/[id]/event-payment-section.tsx)
  - Shows admin's MoMo number (pulled from admin member record)
  - Member clicks "I Have Paid" after sending MoMo
  - Admin sees pending confirmations, clicks "Confirm Received"
  - Payment tracker shows confirmed/pending counts
- DONE: Event photo gallery (src/app/dashboard/events/[id]/event-photo-gallery.tsx)
  - Leaders can upload photos for completed events
  - Grid display with lightbox viewer
  - Caption support
- DONE: Dashboard updated with live upcoming events count and event list cards
- DONE: All routes compile with zero errors
- ACTION REQUIRED: Run supabase/fix-event-payment-update.sql in Supabase SQL Editor
  (adds UPDATE policy so leaders/admin can confirm payments)

### COMPLETED: Phase 5 - Q&A System + Welfare Requests
- DONE: Questions page (src/app/dashboard/questions/page.tsx)
  - All roles can ask questions via "Ask Question" button
  - Admin/Leaders: "Send To" dropdown with "All Members (Broadcast)" or specific member by name
  - Members: questions go to leadership (no dropdown)
  - Leaders/Admin: see ALL questions, respond inline with text reply
  - Members: see own questions + questions directed to them + broadcast questions
  - Expanding card UI with Broadcast (blue) and Direct (purple) badges
  - Direction labels ("To [name]" / "From [name]")
  - Responding auto-sets question status to "answered"
  - Database: added asked_to (uuid) and is_broadcast (boolean) columns to questions table
  - RLS: updated policy so members see questions directed to them or broadcast
  - SQL run: supabase/fix-questions-directed.sql (ALREADY EXECUTED)
- DONE: Welfare page (src/app/dashboard/welfare/page.tsx)
  - All roles can submit welfare requests
  - Type dropdown: bereavement (member/mother/father/spouse/child), sickness, other (per Article 8)
  - Leaders/Admin: see all requests with member photo, name, phone; approve/decline with notes
  - Status badges: Pending (gold), Approved (green), Declined (red)
  - Review notes displayed with reviewer name and date
- NOTE: Event types updated - added "Marriage" and "Funeral" to the dropdown
- NOTE: All event times now display in Ghana timezone (Africa/Accra) with "(Ghana)" label

### COMPLETED: Phase 6 - Announcements + Meeting Minutes
- DONE: Announcements page (src/app/dashboard/announcements/page.tsx)
  - Leaders/Admin: "New Announcement" with title, content, pin checkbox
  - Pinned announcements shown at top with gold background and pin icon
  - Leaders can toggle pin/unpin on any announcement
  - All members can view; shows author name and date
- DONE: Meeting Minutes page (src/app/dashboard/minutes/page.tsx)
  - Leaders/Admin: "Upload Minutes" with title, date, summary, file upload (PDF/DOC)
  - Files uploaded to meeting-minutes storage bucket
  - All members can browse and download
  - Shows file icon, title, date, uploader name, summary preview
- DONE: Dashboard announcements card now shows live data with "View all" link
- DONE: Dashboard announcements count is live
- NOTE: No additional SQL needed (all RLS policies existed in schema.sql)

### COMPLETED: Phase 7 - Admin Panel + Dues Tracking
- DONE: Admin dashboard (src/app/dashboard/admin/page.tsx)
  - Stats grid: total members, active, pending approval, good standing
  - Quick links: Manage Members, Dues & Payments, Create Event
  - Pending approvals list with Approve button
- DONE: Member management (src/app/dashboard/admin/members/page.tsx)
  - Search by name or email
  - Role controls: member/leader/admin toggle buttons
  - Status controls: approve pending, active/suspended toggle
  - Commitment fee paid toggle
  - All with inline update and loading states
- DONE: Dues tracking (src/app/dashboard/admin/dues/page.tsx)
  - Month selector to navigate between months
  - "Generate Dues" button creates GHS 20 record for each active member
  - Stats: paid count, pending count, total collected
  - Per-member list with avatar, name, phone, "Confirm Paid" button
  - Paid members show green "Paid" badge
  - "Update Standing" button recalculates good_standing for all members
    (requires commitment_fee_paid AND all dues paid)
- DONE: All three admin pages compile with zero errors
- ACTION REQUIRED: Run supabase/create-monthly-dues.sql in Supabase SQL Editor
  (creates monthly_dues table with RLS policies)

### COMPLETED: Phase 8 - Email Notifications + Polish
- DONE: Resend email library (src/lib/email.ts)
  - Email templates for: member approved, new event, question answered,
    payment confirmed, welfare decision, new announcement
  - Branded HTML emails with SB green/gold header and cream body
  - Graceful skip when RESEND_API_KEY not set (no crashes in dev)
  - sendBulkEmail helper for broadcasting to all members
  - Uses onboarding@resend.dev in dev, custom domain in production
- DONE: WhatsApp share on announcements (src/app/dashboard/announcements/page.tsx)
  - Share button on every announcement (pinned and regular)
  - Formats title bold, content, and association signature
- DONE: SEO meta tags (src/app/layout.tsx)
  - OpenGraph tags (type, siteName, locale en_GH)
  - Twitter card meta
  - Extended keywords
  - robots index/follow
  - metadataBase set to stbernadettes09.org
- DONE: PWA manifest (public/manifest.json)
  - App name, short name, theme color, background color
  - SVG icons at 192x192 and 512x512 (public/icons/)
  - Standalone display mode, portrait orientation
  - Start URL set to /dashboard
- DONE: PWA head tags in root layout
  - manifest link, theme-color meta, favicon, apple-touch-icon
- DONE: All pages compile with zero errors
- DONE: Resend account created (abanahene54@gmail.com), API key added to .env.local
  - For production, verify domain and set:
    RESEND_FROM_EMAIL=St. Bernadette's '09 <noreply@yourdomain.org>
- NOTE: Email sending is currently not wired into the page actions (it requires
  server actions or API routes to call the email functions from client components).
  This can be wired during deployment or as a follow-up.

### REMAINING PHASES
- Phase 9: Deploy to Vercel

## Payment System Decision
DECISION: Using manual MoMo payment tracking instead of Paystack.
WHY: Paystack charges 1.95% per transaction. For small amounts (GH20 dues, GH100 commitment),
fees are wasteful for a 50-member association. Members already know how to send MoMo directly.
HOW IT WORKS:
1. Admin sets MoMo details (name, number, network) in app settings
2. Members see what they owe + admin's MoMo number to send payment
3. Member clicks "I Have Paid" after sending (optionally enters transaction reference)
4. Admin sees pending confirmations, clicks "Confirm Received" after verifying
5. Dashboard shows payment progress tracker (e.g., "23/45 paid for June dues")
APPLIES TO: Monthly dues, commitment fees, event payments

---

## Tech Stack
- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind CSS v4 + shadcn/ui + Magic UI components
- Framer Motion for animations
- Supabase (PostgreSQL, Auth, Storage) - NOT YET CONNECTED
- Paystack (Ghana Mobile Money) - NOT YET INTEGRATED
- Resend (email notifications) - NOT YET INTEGRATED
- Fonts: Playfair Display (headings), Inter (body)

## Branding
- Primary: Dark green #1B4332
- Accent: Gold #C8962E
- Background: Cream #FAF6F0
- Dark sections: #0D2818
- CSS variables: sb-green, sb-green-dark, sb-green-light, sb-gold,
  sb-gold-light, sb-gold-dark, sb-cream, sb-cream-dark

## Key Files
- src/app/layout.tsx - Root layout with fonts, navbar, footer
- src/app/page.tsx - Home page (client component with animations)
- src/app/about/page.tsx - About page
- src/app/leaders/page.tsx - Leaders page (static data, will be dynamic)
- src/app/events/page.tsx - Events page (empty state placeholder)
- src/app/constitution/page.tsx - Constitution page with PDF download
- src/components/navbar.tsx - Main navigation (client component)
- src/components/footer.tsx - Footer
- src/app/globals.css - Theme colors and Magic UI keyframes
- public/constitution.pdf - Constitution PDF for download

## Design Standards
- Clean, minimal, professional. No clutter.
- Playfair Display (font-heading) for all h1/h2 headings
- Inter (font-sans) for all body text
- Gold underline accent (h-0.5 w-10 bg-sb-gold) under section headings
- BlurFade on all major sections for scroll reveal
- Feature cards: horizontal layout (icon left, text right)
- All text concise. No verbose descriptions.
- Responsive: mobile-first, tested at 375px and 1280px

## Association Details
- Name: St. Bernadette's '09 Association
- School: St. Bernadette's Junior High School, Tafo Nhyiaeso, Kumasi, Ghana
- Year Group: 2009
- Motto: Unity | Support | Progress
- Slogan: One Year Group, One Family
- Members: ~50 max
- Executive Officers (Article 10): President, Vice President, General Secretary,
  Assistant Secretary, Treasurer, Financial Secretary, Organizer, Welfare Officer,
  Public Relations Officer
- Financial Obligations (Article 7): Commitment fee GH100, Monthly dues GH20,
  Welfare contribution GH50

## Important Rules
- All analyses use the collaboration workflow from the parent CLAUDE.md
- No code without explanation and approval
- Present options before making decisions
- Report any tool failures immediately
- Test in browser after every change
- Mobile responsiveness is mandatory
