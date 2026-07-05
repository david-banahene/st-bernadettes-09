-- Run this in Supabase SQL Editor
-- Adds the birthday_wishes table for the automatic Birthday Spotlight feature.
-- One flat, chronological wish thread per (celebrant, year) - no reply
-- nesting needed since there's naturally only one thread per person per year.

create table public.birthday_wishes (
  id uuid primary key default gen_random_uuid(),
  celebrant_id uuid not null references public.members(id) on delete cascade,
  birthday_year int not null,
  author_id uuid not null references public.members(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index birthday_wishes_celebrant_year_idx
  on public.birthday_wishes (celebrant_id, birthday_year, created_at);

alter table public.birthday_wishes enable row level security;

-- Anyone authenticated can read all wishes - it's a public celebratory post
create policy "Anyone can view birthday wishes"
  on public.birthday_wishes for select
  to authenticated
  using (true);

-- Any member can post a wish (or, if they're the celebrant, a reply)
create policy "Members can post birthday wishes"
  on public.birthday_wishes for insert
  to authenticated
  with check (author_id = auth.uid());
