-- Notification Badge System
-- Two tables for lightweight "new content" indicators on tab bar
-- Run this in Supabase SQL Editor

-- 1. Tracks the latest content timestamp per section
-- Updated automatically via triggers when new content is created
create table if not exists content_updates (
  section text primary key,
  last_updated_at timestamptz not null default now()
);

-- Seed with all tracked sections
insert into content_updates (section, last_updated_at) values
  ('events', now()),
  ('announcements', now()),
  ('questions', now()),
  ('welfare', now()),
  ('admin', now())
on conflict (section) do nothing;

-- RLS: all authenticated users can read, only triggers/service role can write
alter table content_updates enable row level security;

create policy "Authenticated users can read content_updates"
  on content_updates for select
  to authenticated
  using (true);

-- 2. Tracks when each user last visited each section
create table if not exists user_section_reads (
  user_id uuid references auth.users(id) on delete cascade,
  section text,
  last_read_at timestamptz not null default now(),
  primary key (user_id, section)
);

-- RLS: users can only read/write their own rows
alter table user_section_reads enable row level security;

create policy "Users can read own section reads"
  on user_section_reads for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can upsert own section reads"
  on user_section_reads for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own section reads"
  on user_section_reads for update
  to authenticated
  using (user_id = auth.uid());

-- 3. Function to bump a section's last_updated_at
create or replace function bump_section_update()
returns trigger as $$
begin
  insert into content_updates (section, last_updated_at)
  values (TG_ARGV[0], now())
  on conflict (section)
  do update set last_updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 4. Triggers: auto-bump when new content is inserted
create or replace trigger trg_events_update
  after insert on events
  for each row execute function bump_section_update('events');

create or replace trigger trg_announcements_update
  after insert on announcements
  for each row execute function bump_section_update('announcements');

create or replace trigger trg_questions_update
  after insert on questions
  for each row execute function bump_section_update('questions');

create or replace trigger trg_question_responses_update
  after insert on question_responses
  for each row execute function bump_section_update('questions');

create or replace trigger trg_welfare_update
  after insert on welfare_requests
  for each row execute function bump_section_update('welfare');

-- Also bump welfare when status changes (approved/declined)
create or replace trigger trg_welfare_status_update
  after update of status on welfare_requests
  for each row execute function bump_section_update('welfare');

-- Bump admin when new members register (pending approval)
create or replace trigger trg_members_update
  after insert on members
  for each row execute function bump_section_update('admin');
