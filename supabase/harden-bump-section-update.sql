-- Run this in Supabase SQL Editor
-- Small hardening follow-up found while designing the group chat's badge
-- integration: bump_section_update() is security definer but was never
-- pinned to a fixed search_path (unlike register_member, which already
-- does this correctly). An unpinned search_path on a security definer
-- function is a known Postgres privilege-escalation vector (a malicious
-- schema earlier in the caller's search_path could shadow an object the
-- function relies on). Not caused by this feature, but trivial to close
-- while touching this file.

create or replace function bump_section_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into content_updates (section, last_updated_at)
  values (TG_ARGV[0], now())
  on conflict (section)
  do update set last_updated_at = now();
  return new;
end;
$$;
