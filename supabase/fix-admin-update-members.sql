-- Allow admin to update any member (approve, change role, change status, etc.)
create policy "Admin can update any member"
  on public.members for update
  to authenticated
  using (
    exists (select 1 from public.members where id = auth.uid() and role = 'admin')
  );
