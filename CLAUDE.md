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
- DONE: Email notifications wired (essential only, to preserve 100/day Resend limit):
  - Member approved: admin approves -> welcome email to member
  - Question answered: leader/admin replies -> email to question asker
  - Event payment confirmed: admin confirms -> email to member
  - Welfare decision: leader approves/declines -> email to requesting member
  - All notifications are fire-and-forget (failure never blocks the action)
  - REMOVED (non-essential): new event, new announcement, dues confirmed
    (WhatsApp share covers bulk notifications; dues visible in app)

### COMPLETED: Phase 9 - Deployment
- DONE: GitHub CLI installed, authenticated as david-banahene
- DONE: GitHub repo created (public): github.com/david-banahene/st-bernadettes-09
- DONE: Password recovery flow added (forgot-password + reset-password pages)
- DONE: Login page updated with "Forgot your password?" link
- DONE: Suspense boundary fix for useSearchParams() in login page
- DONE: Deployed to Vercel (Hobby plan, free)
  - Live URL: https://sbfamily.vercel.app
  - Project name: sbfamily
  - Environment variables configured (Supabase URL, anon key, Resend API key)
- DONE: Supabase URL Configuration updated
  - Site URL: https://sbfamily.vercel.app
  - Redirect URLs: http://localhost:3000/** AND https://sbfamily.vercel.app/**
- DONE: Login tested and working on production
- NOTE: Auto-deploys enabled (push to master = live update in ~60 seconds)
- TODO (post-launch): Clean up test data in Supabase before rolling out to all ~50 members
- TODO (post-launch): Add delete buttons for admin on announcements, events, questions
- TODO (post-launch): Buy custom domain and connect in Vercel
- TODO (post-launch): Dashboard home Standing card - show financial health detail (not just Good/Pending)
- TODO (post-launch): Grace period warning banner (amber) for members approaching dues deadline
- TODO (future): Leader delegation - admin can grant leaders ability to confirm payments, manage dues
- DONE (post-launch): Essential email notifications wired via API routes
- DONE (post-launch): Country code selector on phone inputs (40+ countries, Ghana default)
  - Reusable PhoneInput component (src/components/phone-input.tsx)
  - Applied to registration form (personal + emergency phone)
  - Applied to profile edit page (personal + emergency phone)
  - Numbers stored in full international format (e.g., +233241234567)
- DONE (post-launch): Profile photo required at registration (was optional)
- DONE (post-launch): Bottom tab bar redesign (dark green bg, gold active pill, shadow lift)
  - Icons: cream at 70% opacity (inactive), gold with pill highlight (active)
  - Tap feedback: active:scale-95, labels bumped to 11px
- DONE (post-launch): Notification badge system (red dots on tabs for new content)
  - SQL: supabase/create-notification-badges.sql (ACTION REQUIRED: run in Supabase SQL Editor)
  - Hook: src/hooks/use-badge-notifications.ts
  - Timestamp comparison approach: content_updates + user_section_reads tables
  - Auto-clear on page visit, dots on both mobile tabs and desktop sidebar
- DONE (post-launch): Questions page redesign
  - Single unified list (no Pending/Answered split)
  - Left border color: green = answered, amber = pending
  - Answer preview in collapsed state
  - Indented threading with leadership shield badges
- DONE (post-launch): Toast notifications (Sonner) on all key actions
  - Toaster added to dashboard layout (top-center, richColors)
  - Added to: admin approval, announcements, questions, welfare, profile, payments
- DONE (post-launch): Service worker for shell caching + offline fallback
  - public/sw.js: cache-first for static assets, network-first for pages
  - src/app/offline/page.tsx: branded offline fallback page
  - src/components/sw-register.tsx: registers SW on page load

### ALL 9 PHASES COMPLETE - APP IS LIVE

### COMPLETED: Payment Enforcement System (Post-Launch)
- DONE: Payment wall blocks non-admin members until all financial obligations are cleared
  - Full-screen overlay in dashboard layout, hides sidebar and all content
  - Admin (David) always exempt from the wall
  - Shows: total outstanding, MoMo details, active collection month, each obligation as a card
  - Members tap "I Have Paid" after sending MoMo, admin confirms from admin panel
  - Wall lifts only when ALL obligations are confirmed by admin
  - Component: src/components/payment-wall.tsx
- DONE: SQL migration for payment system (supabase/create-payment-system.sql - EXECUTED)
  - app_settings table (key-value store): momo_name, momo_number, momo_network, active_collection_month
  - commitment_fee_pending column on members table
  - member_claimed status for monthly_dues (member self-reports, admin confirms)
  - restricted membership status option
  - RLS policies for members to read own dues and claim payments
- DONE: Admin MoMo collection settings (Admin Panel > MoMo Collection Details)
  - Recipient name, number, network configurable by admin
  - Shown to all members on payment wall and event payment sections
  - Stored in app_settings table, can be changed to any phone number anytime
- DONE: Commitment fee enforcement
  - All members default to commitment_fee_paid = false
  - Payment wall blocks until commitment fee is confirmed
  - Admin marks paid from Manage Members page or confirms member claims from Admin Panel
  - Standing auto-recalculates on confirmation
- DONE: Enhanced dues management (Admin > Dues & Payments)
  - Active collection month: admin sets which month is being collected, shown to members
  - "Generate for All Members": bulk-creates GHS 20 records for all active members for a month
  - "Add for Specific Member": creates dues for one member for a specific month (for backdated arrears)
  - Month selector to view/manage any month's dues
  - Stats row: paid, pending, claims paid, collected
  - Per-member cards with confirm button (gold highlight for claimed payments)
  - "Update Standing" recalculates good_standing for all members
- DONE: Smart grace periods for payment wall trigger
  - Commitment fee: no grace period (immediate wall)
  - Past-month dues (month < current month): 3-day grace from record creation
  - Current-month dues: 14-day grace from record creation
  - Once grace expires and dues are still pending, payment wall activates
  - Members who claim payment (status = member_claimed) are not walled for that item
- DONE: Dashboard layout updated (src/app/dashboard/layout.tsx)
  - Loads payment fields: good_standing, commitment_fee_paid, commitment_fee_pending
  - Checks commitment fee status + overdue dues with smart grace periods
  - Shows PaymentWall or normal dashboard based on payment status
- DONE: Event payment section uses app_settings for MoMo details (not admin profile)
- DONE: Admin dues page auto-recalculates standing on every payment confirmation

## Payment System Decision
DECISION: Using manual MoMo payment tracking instead of Paystack.
WHY: Paystack charges 1.95% per transaction. For small amounts (GH20 dues, GH100 commitment),
fees are wasteful for a 50-member association. Members already know how to send MoMo directly.
HOW IT WORKS:
1. Admin sets MoMo details (name, number, network) in app settings
2. Admin sets active collection month (shown to members on payment wall)
3. Admin generates dues (bulk for all, or per-member for backdated arrears)
4. Members see what they owe + MoMo details on payment wall
5. Member clicks "I Have Paid" after sending MoMo
6. Admin sees pending claims, clicks "Confirm Received" after verifying
7. Standing auto-recalculates, wall lifts when all obligations confirmed
APPLIES TO: Monthly dues, commitment fees, event payments
GRACE PERIODS: Commitment fee = immediate wall. Past-month dues = 3 days. Current-month = 14 days.

### COMPLETED: Membership Agreement Signing System (Post-Launch)
- DONE: Digital membership agreement signing flow (3-step wizard)
  - Full-screen agreement wall blocks non-admin approved members until they sign
  - Gate order: Login > Approval > AGREEMENT WALL > Payment Wall > Dashboard
  - Step 1: Review 5 constitutional sections (card accordion with progress tracking)
    - Membership, Good Standing, Financial Obligations, Welfare & Benefits, Discipline & Forfeiture
    - Each section must be expanded at least once before proceeding
    - Progress bar shows "X of 5 sections reviewed"
    - Green checkmarks appear on read sections
  - Step 2: Signature pad (finger/mouse drawing on HTML5 Canvas)
    - Checkbox: "I, [Name], have read and agree to abide by the Constitution..."
    - Both signature and checkbox required to submit
  - Step 3: Celebration screen with confetti, animated checkmark, membership card
    - WhatsApp share via Web Share API
    - "Continue to Dashboard" button (refreshes page to pass gate)
  - Component: src/components/agreement-wall.tsx
  - SQL migration: supabase/create-agreement-system.sql (ACTION REQUIRED: run in Supabase SQL Editor)
  - Database: signed_agreement_at (timestamptz) + signature_url (text) columns on members table
  - Storage: member-signatures bucket in Supabase Storage
  - Packages: react-signature-canvas, signature_pad, canvas-confetti, pdf-lib
- DONE: Admin visibility
  - Manage Members page: "Signed" (green) / "Not Signed" (amber) badges on each member
  - Admin Dashboard: "Agreement Signed: X of Y" stat card
- DONE: All existing and new members must sign (admin exempt)
- DONE: Legally valid under Ghana's Electronic Transactions Act 2008 (Act 772)

### COMPLETED: Association Logo Recreation (Post-Launch)
- DONE: Recreated original logo from constitution PDF as SVG
  - Circular dark green badge with gold outer border ring
  - "SB" in gold serif at top, open book icon (cream) in center, "2009" at bottom
  - Green wave/hill behind book, inner subtle gold ring for depth
  - SVG with textPath for logo.svg, positioned text for PWA icons
- DONE: Updated PWA icons (icon-192.svg, icon-512.svg) with new badge design
- DONE: Updated navbar logo (desktop + mobile) to use SVG instead of CSS circle
- DONE: Updated OG/Twitter images with badge logo design (Satori-compatible)

---

## Tech Stack
- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind CSS v4 + shadcn/ui + Magic UI components
- Framer Motion for animations
- Supabase (PostgreSQL, Auth, Storage, RLS) - eu-west-2 London
- Resend (email notifications) - free tier, 100/day
- Sonner (toast notifications) - via shadcn/ui
- Manual MoMo payment tracking (no Paystack - see Payment System Decision)
- react-signature-canvas + signature_pad (digital signature capture)
- pdf-lib (signed agreement PDF generation)
- canvas-confetti (celebration animations)
- Service worker for offline support + fast repeat loads
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
