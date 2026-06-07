-- Run this in Supabase SQL Editor
-- Adds UPDATE policy so leaders/admin can confirm MoMo payments

create policy "Leaders can update event payments"
  on public.event_payments for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role in ('leader', 'admin'))
  );
