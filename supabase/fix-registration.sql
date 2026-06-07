-- Fix: Registration fails because email confirmation is enabled.
-- When a user signs up, there is no active session yet (they must confirm
-- email first), so the RLS policy blocks the member profile insert.
--
-- Solution: Create a database function with SECURITY DEFINER that runs
-- with elevated privileges, bypassing RLS for the initial registration.
-- The function validates that the user ID exists in auth.users before inserting.

create or replace function public.register_member(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone_number text,
  p_town_or_city text,
  p_next_of_kin text,
  p_emergency_contact_name text,
  p_emergency_contact_phone text,
  p_parents_names text,
  p_spouse_name text default null,
  p_children_names text default null,
  p_date_of_birth date default null,
  p_photo_url text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Verify the user actually exists in auth.users
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'Invalid user ID';
  end if;

  -- Insert the member profile
  insert into public.members (
    id, email, full_name, phone_number, town_or_city,
    next_of_kin, emergency_contact_name, emergency_contact_phone,
    parents_names, spouse_name, children_names, date_of_birth, photo_url
  ) values (
    p_user_id, p_email, p_full_name, p_phone_number, p_town_or_city,
    p_next_of_kin, p_emergency_contact_name, p_emergency_contact_phone,
    p_parents_names, p_spouse_name, p_children_names, p_date_of_birth, p_photo_url
  );
end;
$$;

-- Allow anon and authenticated roles to call this function
grant execute on function public.register_member to anon;
grant execute on function public.register_member to authenticated;
