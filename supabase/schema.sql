-- ============================================================
-- St. Bernadette's '09 Association - Database Schema
-- Run this entire file in Supabase SQL Editor (one time only)
-- ============================================================

-- 1. MEMBERS TABLE
-- Stores all member information (linked to Supabase Auth users)
create table public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  phone_number text not null,
  town_or_city text not null,
  next_of_kin text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  parents_names text not null,
  spouse_name text,
  children_names text,
  photo_url text,
  date_of_birth date,
  role text not null default 'member' check (role in ('member', 'leader', 'admin')),
  membership_status text not null default 'pending' check (membership_status in ('pending', 'active', 'suspended')),
  good_standing boolean not null default false,
  commitment_fee_paid boolean not null default false,
  joined_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. LEADERS TABLE
-- Maps members to executive positions
create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  position text not null,
  profession text not null default '',
  bio text,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- 3. EVENTS TABLE
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_type text not null default 'Meeting',
  event_date timestamptz not null,
  end_date timestamptz,
  location text not null,
  cover_image_url text,
  requires_payment boolean not null default false,
  payment_amount decimal,
  payment_currency text not null default 'GHS',
  status text not null default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by uuid references public.members(id),
  created_at timestamptz default now()
);

-- 4. EVENT PHOTOS TABLE
create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  photo_url text not null,
  caption text,
  uploaded_by uuid references public.members(id),
  created_at timestamptz default now()
);

-- 5. EVENT PAYMENTS TABLE
create table public.event_payments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  amount decimal not null,
  currency text not null default 'GHS',
  payment_method text,
  paystack_reference text,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 6. QUESTIONS TABLE
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  asked_by uuid not null references public.members(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'answered')),
  created_at timestamptz default now()
);

-- 7. QUESTION RESPONSES TABLE
create table public.question_responses (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  responded_by uuid not null references public.members(id),
  message text not null,
  created_at timestamptz default now()
);

-- 8. MONTHLY DUES TABLE
create table public.monthly_dues (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  month date not null,
  amount decimal not null default 20.00,
  paystack_reference text,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 9. ANNOUNCEMENTS TABLE
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  pinned boolean not null default false,
  created_by uuid references public.members(id),
  created_at timestamptz default now()
);

-- 10. WELFARE REQUESTS TABLE
create table public.welfare_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  type text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  reviewed_by uuid references public.members(id),
  review_notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- 11. MEETING MINUTES TABLE
create table public.meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date not null,
  summary text,
  file_url text not null,
  uploaded_by uuid references public.members(id),
  created_at timestamptz default now()
);


-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- Controls who can read/write what data
-- ============================================================

-- MEMBERS: Anyone authenticated can read basic info, only self can update own profile
alter table public.members enable row level security;

create policy "Members can view all active members"
  on public.members for select
  to authenticated
  using (true);

create policy "Members can update their own profile"
  on public.members for update
  to authenticated
  using (id = auth.uid());

create policy "Allow insert during registration"
  on public.members for insert
  to authenticated
  with check (id = auth.uid());

-- LEADERS: Anyone can read (public page), only admin can modify
alter table public.leaders enable row level security;

create policy "Anyone can view leaders"
  on public.leaders for select
  using (true);

create policy "Admin can manage leaders"
  on public.leaders for all
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role = 'admin')
  );

-- EVENTS: Anyone can read, leaders/admin can create/update
alter table public.events enable row level security;

create policy "Anyone can view events"
  on public.events for select
  using (true);

create policy "Leaders can manage events"
  on public.events for insert
  to authenticated
  with check (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

create policy "Leaders can update events"
  on public.events for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

-- EVENT PHOTOS: Anyone can view, leaders can upload
alter table public.event_photos enable row level security;

create policy "Anyone can view event photos"
  on public.event_photos for select
  using (true);

create policy "Leaders can upload event photos"
  on public.event_photos for insert
  to authenticated
  with check (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

-- EVENT PAYMENTS: Members see own, leaders see all
alter table public.event_payments enable row level security;

create policy "Members can view own payments"
  on public.event_payments for select
  to authenticated
  using (
    member_id = auth.uid() or
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

create policy "Members can create own payments"
  on public.event_payments for insert
  to authenticated
  with check (member_id = auth.uid());

-- QUESTIONS: Members see own, leaders see all
alter table public.questions enable row level security;

create policy "Members can view own questions, leaders see all"
  on public.questions for select
  to authenticated
  using (
    asked_by = auth.uid() or
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

create policy "Members can ask questions"
  on public.questions for insert
  to authenticated
  with check (asked_by = auth.uid());

create policy "Leaders can update question status"
  on public.questions for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

-- QUESTION RESPONSES: Linked to question visibility
alter table public.question_responses enable row level security;

create policy "View responses for visible questions"
  on public.question_responses for select
  to authenticated
  using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
      and (q.asked_by = auth.uid() or exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin')))
    )
  );

create policy "Leaders can respond to questions"
  on public.question_responses for insert
  to authenticated
  with check (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

-- MONTHLY DUES: Members see own, leaders see all
alter table public.monthly_dues enable row level security;

create policy "Members view own dues, leaders see all"
  on public.monthly_dues for select
  to authenticated
  using (
    member_id = auth.uid() or
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

create policy "System can create dues records"
  on public.monthly_dues for insert
  to authenticated
  with check (true);

-- ANNOUNCEMENTS: All authenticated can read, leaders can create
alter table public.announcements enable row level security;

create policy "All members can view announcements"
  on public.announcements for select
  to authenticated
  using (true);

create policy "Leaders can create announcements"
  on public.announcements for insert
  to authenticated
  with check (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

create policy "Leaders can update announcements"
  on public.announcements for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

-- WELFARE REQUESTS: Members see own, leaders see all
alter table public.welfare_requests enable row level security;

create policy "Members view own welfare requests, leaders see all"
  on public.welfare_requests for select
  to authenticated
  using (
    member_id = auth.uid() or
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

create policy "Members can submit welfare requests"
  on public.welfare_requests for insert
  to authenticated
  with check (member_id = auth.uid());

create policy "Leaders can update welfare requests"
  on public.welfare_requests for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );

-- MEETING MINUTES: All authenticated can read, leaders can upload
alter table public.meeting_minutes enable row level security;

create policy "All members can view meeting minutes"
  on public.meeting_minutes for select
  to authenticated
  using (true);

create policy "Leaders can upload meeting minutes"
  on public.meeting_minutes for insert
  to authenticated
  with check (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );


-- ============================================================
-- STORAGE BUCKETS
-- For member photos, event photos, and meeting minutes
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('member-photos', 'member-photos', true),
  ('event-photos', 'event-photos', true),
  ('event-covers', 'event-covers', true),
  ('meeting-minutes', 'meeting-minutes', true);

-- Storage policies: authenticated users can upload to member-photos
create policy "Members can upload own photo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'member-photos');

create policy "Anyone can view member photos"
  on storage.objects for select
  using (bucket_id = 'member-photos');

create policy "Leaders can upload event photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('event-photos', 'event-covers'));

create policy "Anyone can view event photos"
  on storage.objects for select
  using (bucket_id in ('event-photos', 'event-covers'));

create policy "Leaders can upload meeting minutes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'meeting-minutes');

create policy "Members can view meeting minutes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'meeting-minutes');
