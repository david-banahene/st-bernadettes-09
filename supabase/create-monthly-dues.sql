-- Monthly Dues table for tracking member payments
create table if not exists public.monthly_dues (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.members(id) not null,
  month date not null,
  amount numeric(10,2) not null default 20.00,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Unique constraint: one dues record per member per month
alter table public.monthly_dues
  add constraint unique_member_month unique (member_id, month);

-- Enable RLS
alter table public.monthly_dues enable row level security;

-- Admin can do everything
create policy "Admin can manage all dues"
  on public.monthly_dues for all
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.members where id = auth.uid() and role = 'admin')
  );

-- Members can view their own dues
create policy "Members can view own dues"
  on public.monthly_dues for select
  to authenticated
  using (member_id = auth.uid());
