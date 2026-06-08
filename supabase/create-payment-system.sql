-- Payment Enforcement System
-- Run this in Supabase SQL Editor
-- Creates app_settings table and updates membership_status constraint

-- 1. App Settings table (key-value store for admin-configurable settings)
create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Seed with default MoMo collection details and active collection month
insert into app_settings (key, value) values
  ('momo_name', 'Not Set'),
  ('momo_number', '0000000000'),
  ('momo_network', 'MTN MoMo'),
  ('active_collection_month', to_char(now(), 'YYYY-MM') || '-01')
on conflict (key) do nothing;

-- RLS: all authenticated users can read, only admin can write
alter table app_settings enable row level security;

create policy "Authenticated users can read app_settings"
  on app_settings for select
  to authenticated
  using (true);

create policy "Admin can update app_settings"
  on app_settings for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role = 'admin')
  );

create policy "Admin can insert app_settings"
  on app_settings for insert
  to authenticated
  with check (
    exists (select 1 from public.members where id = auth.uid() and role = 'admin')
  );

-- 2. Add 'restricted' to membership_status allowed values
-- First drop the existing constraint, then add the new one
alter table public.members drop constraint if exists members_membership_status_check;
alter table public.members add constraint members_membership_status_check
  check (membership_status in ('pending', 'active', 'suspended', 'restricted'));

-- 3. Add commitment_fee_pending column to track "I Have Paid" claims
-- This lets members claim they paid, admin confirms by setting commitment_fee_paid = true
alter table public.members add column if not exists commitment_fee_pending boolean not null default false;

-- 4. Add pending status to monthly_dues for member self-reporting
-- Members can now mark dues as 'member_claimed' before admin confirms as 'paid'
-- Note: The existing check constraint allows 'pending' and 'paid'. We need to add 'member_claimed'.
alter table public.monthly_dues drop constraint if exists monthly_dues_status_check;
alter table public.monthly_dues add constraint monthly_dues_status_check
  check (status in ('pending', 'member_claimed', 'paid'));

-- 5. RLS policy so members can read their own dues
-- Check if policy exists first by using create or replace pattern
do $$
begin
  -- Allow members to read their own dues
  if not exists (
    select 1 from pg_policies where tablename = 'monthly_dues' and policyname = 'Members can read own dues'
  ) then
    create policy "Members can read own dues"
      on monthly_dues for select
      to authenticated
      using (member_id = auth.uid() or exists (
        select 1 from public.members where id = auth.uid() and role in ('admin', 'leader')
      ));
  end if;
end $$;

-- 6. Allow members to update their own dues (to mark as member_claimed)
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'monthly_dues' and policyname = 'Members can claim own dues'
  ) then
    create policy "Members can claim own dues"
      on monthly_dues for update
      to authenticated
      using (member_id = auth.uid());
  end if;
end $$;
