-- Fix: Make notification badges universal across all tabs
-- Run this in Supabase SQL Editor
-- Adds "minutes" and "members" sections, plus more admin triggers

-- 1. Add missing sections to content_updates
insert into content_updates (section, last_updated_at) values
  ('minutes', now()),
  ('members', now())
on conflict (section) do nothing;

-- 2. Trigger: new meeting minutes uploaded -> badge on Minutes tab
create or replace trigger trg_minutes_update
  after insert on meeting_minutes
  for each row execute function bump_section_update('minutes');

-- 3. Trigger: member approved (status changes to active) -> badge on Members tab
-- So everyone knows a new member joined the directory
create or replace trigger trg_members_directory_update
  after update of membership_status on members
  for each row
  when (NEW.membership_status = 'active' AND OLD.membership_status != 'active')
  execute function bump_section_update('members');

-- 4. More admin triggers: payment claims need admin attention
-- When a member clicks "I Have Paid" on event payment
create or replace trigger trg_admin_event_payment
  after insert on event_payments
  for each row execute function bump_section_update('admin');

-- When event payment status changes (confirmed by admin)
create or replace trigger trg_admin_event_payment_status
  after update of status on event_payments
  for each row execute function bump_section_update('admin');

-- When monthly dues are generated or status changes
create or replace trigger trg_admin_dues_insert
  after insert on monthly_dues
  for each row execute function bump_section_update('admin');

create or replace trigger trg_admin_dues_status
  after update of status on monthly_dues
  for each row execute function bump_section_update('admin');

-- When a member signs the agreement (admin should know)
create or replace trigger trg_admin_agreement_signed
  after update of signed_agreement_at on members
  for each row
  when (NEW.signed_agreement_at is not null AND OLD.signed_agreement_at is null)
  execute function bump_section_update('admin');
