# St. Bernadette's '09 Association - Web Application Plan

## Context

David Banahene designed the constitution for St. Bernadette's '09 Association (St. Bernadette's Junior High School, Tafo Nhyiaeso, Kumasi, Ghana, Year Group 2009). The association has ~50 members in Ghana, and David manages it from the USA. They need a professional web application for member registration, event management with Mobile Money payments, leadership directory, and a private Q&A system. David has no web development experience; this plan is designed to be built incrementally with browser verification at each phase.

---

## Branding (extracted from constitution PDF)

- **Name:** St. Bernadette's '09 Association
- **Motto:** Unity | Support | Progress
- **Slogan:** One Year Group, One Family
- **Logo:** Circular badge with "SB", open book, "2009"
- **Primary color:** Dark green (#1B4332)
- **Accent color:** Gold (#C8962E)
- **Background:** Cream (#FAF6F0)
- **Text:** Dark charcoal (#1A1A1A)
- **Dark header/footer:** Deep green (#0D2818)

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack React framework, SSR, API routes, Vercel-optimized |
| Styling | Tailwind CSS + shadcn/ui | Modern utility-first CSS, pre-built accessible components |
| Database | Supabase (PostgreSQL) | Free tier handles 50 members, built-in auth, file storage, real-time |
| Auth | Supabase Auth | Email/password login, role-based access, session management |
| File Storage | Supabase Storage | Member photo uploads (500MB free tier) |
| Payments | Manual MoMo Tracking | Admin displays MoMo number, members pay directly, admin confirms receipt in-app. Zero fees. |
| Email | Resend | Transactional emails (100/day free, sufficient for 50 members) |
| Hosting | Vercel | Free hobby tier, global CDN, automatic deploys |
| Domain | Custom (.com or .org) | ~$10-15/year via Namecheap or similar |

### Cost Estimate: $0-2/month
- Vercel free tier: $0
- Supabase free tier: $0
- Resend free tier: $0
- Payments: $0 (manual MoMo, no transaction fees)
- Domain: ~$1/month amortized

---

## Database Schema

### Tables

**members**
- id (uuid, PK)
- email (text, unique)
- full_name (text)
- phone_number (text)
- town_or_city (text)
- next_of_kin (text)
- emergency_contact_name (text)
- emergency_contact_phone (text)
- parents_names (text)
- spouse_name (text, nullable)
- children_names (text, nullable)
- photo_url (text, nullable)
- date_of_birth (date, nullable) -- for birthday display
- role (enum: member | leader | admin)
- membership_status (enum: pending | active | suspended)
- good_standing (boolean, default false) -- computed from dues/fees status
- commitment_fee_paid (boolean, default false)
- joined_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)

**leaders**
- id (uuid, PK)
- member_id (uuid, FK -> members)
- position (text) -- President, Vice President, etc.
- profession (text)
- bio (text, nullable)
- display_order (int)

**events**
- id (uuid, PK)
- title (text)
- description (text)
- event_type (text) -- e.g., "Meeting", "Fundraiser", "Reunion", "Welfare", "Social"
- event_date (timestamptz)
- end_date (timestamptz, nullable)
- location (text)
- cover_image_url (text, nullable) -- announcement banner/poster image
- requires_payment (boolean)
- payment_amount (decimal, nullable)
- payment_currency (text, default 'GHS')
- status (enum: upcoming | ongoing | completed | cancelled)
- created_by (uuid, FK -> members)
- created_at (timestamptz)

**event_photos**
- id (uuid, PK)
- event_id (uuid, FK -> events)
- photo_url (text)
- caption (text, nullable)
- uploaded_by (uuid, FK -> members)
- created_at (timestamptz)

**event_payments**
- id (uuid, PK)
- event_id (uuid, FK -> events)
- member_id (uuid, FK -> members)
- amount (decimal)
- currency (text, default 'GHS')
- payment_method (text) -- mtn_momo, telecel_cash, airteltigo
- paystack_reference (text)
- status (enum: pending | success | failed)
- paid_at (timestamptz)
- created_at (timestamptz)

**questions**
- id (uuid, PK)
- asked_by (uuid, FK -> members)
- subject (text)
- message (text)
- status (enum: pending | answered)
- created_at (timestamptz)

**question_responses**
- id (uuid, PK)
- question_id (uuid, FK -> questions)
- responded_by (uuid, FK -> members)
- message (text)
- created_at (timestamptz)

**monthly_dues**
- id (uuid, PK)
- member_id (uuid, FK -> members)
- month (date) -- first of the month
- amount (decimal)
- paystack_reference (text, nullable)
- status (enum: pending | paid)
- paid_at (timestamptz, nullable)

**announcements**
- id (uuid, PK)
- title (text)
- content (text)
- pinned (boolean, default false)
- created_by (uuid, FK -> members)
- created_at (timestamptz)

**welfare_requests**
- id (uuid, PK)
- member_id (uuid, FK -> members)
- type (text) -- "bereavement_member", "bereavement_mother", "bereavement_father", "bereavement_spouse", "bereavement_child", "sickness", "other"
- description (text)
- status (enum: pending | approved | declined)
- reviewed_by (uuid, FK -> members, nullable)
- review_notes (text, nullable)
- created_at (timestamptz)
- reviewed_at (timestamptz, nullable)

**meeting_minutes**
- id (uuid, PK)
- title (text) -- e.g., "General Meeting - June 2026"
- meeting_date (date)
- summary (text, nullable)
- file_url (text) -- uploaded PDF/document
- uploaded_by (uuid, FK -> members)
- created_at (timestamptz)

---

## Application Pages & Features

### Public Pages (no login required)
1. **Home** (`/`) - Hero section with logo, motto, slogan, about the association, call-to-action to register, latest announcements preview
2. **About** (`/about`) - Association history, aims & objectives (from Article 4), school info
3. **Leaders** (`/leaders`) - Grid of filled executive positions only (unfilled positions hidden), with photo, position, profession, contact
4. **Events** (`/events`) - Upcoming events with live countdown timers, event type badges, location, and professional announcement cards. Completed events show photo galleries. WhatsApp share buttons on each event.
5. **Constitution** (`/constitution`) - View and download the official constitution PDF
6. **Register** (`/register`) - Membership application form with photo upload and date of birth
7. **Login** (`/login`) - Email/password login for members

### Member Pages (login required, role: member+)
7. **Dashboard** (`/dashboard`) - Welcome message, upcoming events with countdown, dues status, Good Standing badge, birthday celebrants this month, recent announcements feed
8. **My Profile** (`/dashboard/profile`) - View/edit personal info, upload/change photo, Good Standing status indicator
9. **Events Detail** (`/dashboard/events/[id]`) - Full event details with countdown timer, event type, location, announcement poster/banner. Mobile Money payment for events requiring payment. Photo gallery for completed events. WhatsApp share button.
10. **Ask a Question** (`/dashboard/questions`) - Submit a question, view status of own questions (pending/answered), read full responses in-app + email notification when answered
11. **Member Directory** (`/dashboard/members`) - View other members (name, photo, town only; full contact details visible only to leaders/admin)
12. **Announcements** (`/dashboard/announcements`) - View all announcements from leaders/admin
13. **Welfare Request** (`/dashboard/welfare`) - Submit welfare cases (bereavement, sickness per Article 8), view status of own requests
14. **Meeting Minutes** (`/dashboard/minutes`) - Browse and download past meeting minutes

### Leader Pages (login required, role: leader+)
15. **Q&A Management** (`/dashboard/admin/questions`) - View all pending questions, respond to them, mark as done
16. **Event Management** (`/dashboard/admin/events`) - Create/edit/cancel events with announcement poster upload, set event type and location, upload event photos after event, view payment records per event with timestamps
17. **Member Management** (`/dashboard/admin/members`) - View all member details (full contact info), approve pending registrations
18. **Post Announcement** (`/dashboard/admin/announcements`) - Create/edit/pin announcements
19. **Welfare Management** (`/dashboard/admin/welfare`) - Review welfare requests, approve/decline, add notes
20. **Upload Meeting Minutes** (`/dashboard/admin/minutes`) - Upload meeting minutes PDF with date and summary

### Admin Pages (login required, role: admin)
21. **Full Admin Panel** (`/dashboard/admin`) - All leader functions + manage roles, view financial summary, manage leaders section
22. **Dues Tracking** (`/dashboard/admin/dues`) - View monthly dues payment status for all members, Good Standing computation

---

## Role Permissions

| Feature | Member | Leader | Admin |
|---|---|---|---|
| View public pages & constitution | Yes | Yes | Yes |
| View own profile, dues & standing | Yes | Yes | Yes |
| Ask questions | Yes | Yes | Yes |
| View member directory (name/photo/town) | Yes | Yes | Yes |
| Pay for events | Yes | Yes | Yes |
| Submit welfare requests | Yes | Yes | Yes |
| View announcements & meeting minutes | Yes | Yes | Yes |
| View full member contact details | No | Yes | Yes |
| Respond to questions | No | Yes | Yes |
| Create/manage events & upload photos | No | Yes | Yes |
| View payment records | No | Yes | Yes |
| Post announcements | No | Yes | Yes |
| Review welfare requests | No | Yes | Yes |
| Upload meeting minutes | No | Yes | Yes |
| Approve new members | No | No | Yes |
| Manage roles | No | No | Yes |
| Manage leaders section | No | No | Yes |
| View financial summary | No | No | Yes |

---

## Build Phases (Incremental)

### Phase 1: Project Setup & Landing Page
- Initialize Next.js 15 project with TypeScript, Tailwind CSS, shadcn/ui
- Configure as Progressive Web App (PWA) - installable on phone home screens
- Set up project structure (app router, components, lib folders)
- Build the public home page with association branding, latest announcements preview
- Build the about page (aims & objectives from Article 4)
- Build the leaders page (static initially, only filled positions)
- Build the constitution page (view/download PDF)
- Responsive design for mobile/desktop
- **Verify:** View in browser on desktop and mobile viewport, test PWA install

### Phase 2: Database & Authentication
- Set up Supabase project (database, auth, storage)
- Create all database tables and RLS policies
- Build registration form with photo upload and date of birth
- Build login/logout flow
- Build member dashboard shell with sidebar navigation
- **Verify:** Register a test member, log in, see dashboard

### Phase 3: Member Features
- Member profile page (view/edit) with Good Standing badge
- Member directory (name, photo, town only)
- Dashboard with: upcoming events countdown, dues status, birthday celebrants this month, announcements feed, Good Standing indicator
- **Verify:** Edit profile, browse directory, see birthdays

### Phase 4: Events System
- Event creation form (leaders/admin) with event type, location, announcement poster/banner upload
- Event listing with live countdown timers, event type badges, location display
- Professional event announcement cards on public events page
- WhatsApp share buttons on events
- Paystack Mobile Money integration for event payments (MTN MoMo, Telecel Cash, AirtelTigo)
- Payment records with timestamps per event
- Event photo gallery (leaders upload photos after event is completed)
- **Verify:** Create event, see countdown, share to WhatsApp, upload poster, make test MoMo payment (Paystack sandbox), upload event photos, verify gallery display

### Phase 5: Q&A System & Welfare
- Question submission form (members)
- Question list with pending/answered status
- Response form (leaders), email notification when answered
- Welfare request submission (bereavement types per Article 8, sickness, other)
- Welfare review panel for leaders (approve/decline with notes)
- **Verify:** Submit question, respond as leader, submit welfare request, review and approve

### Phase 6: Announcements & Meeting Minutes
- Announcement creation (leaders/admin) with pin support
- Announcements feed on dashboard and public home page
- Meeting minutes upload (PDF) with date and summary
- Meeting minutes browse and download for members
- **Verify:** Post announcement, verify on dashboard and home page, upload minutes, download as member

### Phase 7: Admin Panel & Dues
- Admin dashboard with financial summary
- Member approval workflow
- Role management
- Monthly dues tracking with Good Standing computation
- Leaders section management (add/edit/reorder)
- **Verify:** Full admin workflow test

### Phase 8: Email Notifications & Polish
- Email notifications (new event, question answered, payment confirmed, member approved, welfare decision, new announcement)
- WhatsApp share integration on announcements
- Loading states, error handling, empty states
- SEO meta tags
- PWA manifest, icons, offline support
- Final responsive design audit
- Performance optimization
- **Verify:** Full end-to-end test of all features on mobile and desktop

### Phase 9: Deployment
- Deploy to Vercel
- Connect custom domain (if purchased)
- Set up Paystack live keys
- Create admin account for David
- Create documentation for leaders on how to use the app
- **Verify:** Live site accessible, all features working in production, PWA installable

---

## Verification Strategy

Each phase will be verified by:
1. Running the Next.js dev server locally
2. Opening in browser (Claude in Chrome) to visually inspect
3. Testing on both desktop and mobile viewports
4. Testing the golden path (happy path) for each feature
5. Testing edge cases (empty states, invalid input, unauthorized access)

---

## Project Location

The project will be created at: `D:\AI_Tools\Claude_Bucket\st-bernadettes-09`

---

## Key Technical Decisions

1. **Next.js App Router** over Pages Router: Modern standard, better server components, simpler data fetching
2. **Supabase** over Firebase: Better PostgreSQL support, more generous free tier, Row Level Security
3. **Paystack** over Hubtel: Better developer documentation, wider Ghana MoMo coverage, sandbox testing
4. **shadcn/ui** over Material UI: Lighter, more customizable, works natively with Tailwind
5. **Resend** over SendGrid: Simpler API, React email templates, generous free tier
6. **Server Actions** over API routes where possible: Simpler code, type-safe, built into Next.js 15
