-- Universal Notification Badge System (FULL REBUILD)
-- Run this in Supabase SQL Editor
-- Re-creates everything from scratch so nothing is missing
-- Safe to run multiple times (all CREATE OR REPLACE / ON CONFLICT)

-- ============================================================
-- 1. TABLES (already exist, just ensure sections are seeded)
-- ============================================================

-- Ensure all 7 sections exist in content_updates
insert into content_updates (section, last_updated_at) values
  ('events', now()),
  ('announcements', now()),
  ('questions', now()),
  ('welfare', now()),
  ('admin', now()),
  ('minutes', now()),
  ('members', now())
on conflict (section) do nothing;

-- ============================================================
-- 2. CORE FUNCTION (re-create to ensure it exists and works)
-- ============================================================

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

-- ============================================================
-- 3. ALL TRIGGERS (re-create every single one)
-- ============================================================

-- EVENTS TAB: new event created
create or replace trigger trg_events_update
  after insert on events
  for each row execute function bump_section_update('events');

-- ANNOUNCEMENTS TAB: new announcement posted
create or replace trigger trg_announcements_update
  after insert on announcements
  for each row execute function bump_section_update('announcements');

-- QUESTIONS TAB: new question asked
create or replace trigger trg_questions_update
  after insert on questions
  for each row execute function bump_section_update('questions');

-- QUESTIONS TAB: question answered
create or replace trigger trg_question_responses_update
  after insert on question_responses
  for each row execute function bump_section_update('questions');

-- WELFARE TAB: new welfare request
create or replace trigger trg_welfare_update
  after insert on welfare_requests
  for each row execute function bump_section_update('welfare');

-- WELFARE TAB: welfare status changed (approved/declined)
create or replace trigger trg_welfare_status_update
  after update of status on welfare_requests
  for each row execute function bump_section_update('welfare');

-- MINUTES TAB: new meeting minutes uploaded
create or replace trigger trg_minutes_update
  after insert on meeting_minutes
  for each row execute function bump_section_update('minutes');

-- MEMBERS TAB: member approved (appears in directory)
create or replace trigger trg_members_directory_update
  after update of membership_status on members
  for each row
  when (NEW.membership_status = 'active' AND OLD.membership_status != 'active')
  execute function bump_section_update('members');

-- ADMIN TAB: new member registered (pending approval)
create or replace trigger trg_members_update
  after insert on members
  for each row execute function bump_section_update('admin');

-- ADMIN TAB: member claims event payment ("I Have Paid")
create or replace trigger trg_admin_event_payment
  after insert on event_payments
  for each row execute function bump_section_update('admin');

-- ADMIN TAB: event payment status changes (confirmed)
create or replace trigger trg_admin_event_payment_status
  after update of status on event_payments
  for each row execute function bump_section_update('admin');

-- ADMIN TAB: monthly dues generated
create or replace trigger trg_admin_dues_insert
  after insert on monthly_dues
  for each row execute function bump_section_update('admin');

-- ADMIN TAB: dues status changes (paid/claimed)
create or replace trigger trg_admin_dues_status
  after update of status on monthly_dues
  for each row execute function bump_section_update('admin');

-- ADMIN TAB: member signs agreement
create or replace trigger trg_admin_agreement_signed
  after update of signed_agreement_at on members
  for each row
  when (NEW.signed_agreement_at is not null AND OLD.signed_agreement_at is null)
  execute function bump_section_update('admin');
