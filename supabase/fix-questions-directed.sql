-- Run this in Supabase SQL Editor
-- Adds directed/broadcast question support

-- Add columns for directing questions to specific members or all
alter table public.questions add column asked_to uuid references public.members(id);
alter table public.questions add column is_broadcast boolean not null default false;

-- Drop old select policy and create new one that lets members see
-- questions directed to them or broadcast to all
drop policy "Members can view own questions, leaders see all" on public.questions;

create policy "Members can view relevant questions"
  on public.questions for select
  to authenticated
  using (
    asked_by = auth.uid()
    or asked_to = auth.uid()
    or is_broadcast = true
    or exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );
