-- Run this in Supabase SQL Editor (after add-message-edit-reply.sql and
-- create-group-messages.sql)
-- RPCs for edit / unsend / admin-delete. All security definer so they can
-- perform the one column-scoped mutation each is responsible for, bypassing
-- RLS's default-deny (group_messages has no UPDATE policy at all) - each
-- function enforces its own authorization internally instead. All pin
-- search_path = public (matching the register_member precedent) to close
-- off the search-path privilege-escalation vector.
--
-- Each sets a transaction-local flag (set_config(..., true) - the "true"
-- third argument scopes it to the current transaction only, which matters
-- under Supabase's pooled/transaction-mode connections so it can never leak
-- into an unrelated later request on a reused connection) immediately
-- before its own UPDATE, so the protect-fields triggers on both tables let
-- exactly this one write through.

-- ===== messages (1:1 private) =====

create or replace function edit_direct_message(p_message_id uuid, p_new_content text)
returns setof public.messages
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_new_content is null or length(trim(p_new_content)) = 0 then
    raise exception 'Message content cannot be empty';
  end if;

  perform set_config('app.trusted_message_mutation', 'true', true);

  return query
  update public.messages
  set content = p_new_content,
      edited_at = now()
  where id = p_message_id
    and sender_id = auth.uid()
    and deleted_at is null
  returning *;

  if not found then
    raise exception 'Message not found, not yours, or already deleted';
  end if;
end;
$$;

grant execute on function edit_direct_message(uuid, text) to authenticated;

create or replace function unsend_direct_message(p_message_id uuid)
returns setof public.messages
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.trusted_message_mutation', 'true', true);

  return query
  update public.messages
  set content = null,
      deleted_at = now(),
      deleted_by = null  -- null = self-unsent, distinct from admin-removed
  where id = p_message_id
    and sender_id = auth.uid()
    and deleted_at is null
  returning *;

  if not found then
    raise exception 'Message not found, not yours, or already deleted';
  end if;
end;
$$;

grant execute on function unsend_direct_message(uuid) to authenticated;

-- ===== group_messages (The Common Room) =====

create or replace function edit_group_message(p_message_id uuid, p_new_content text)
returns setof public.group_messages
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_new_content is null or length(trim(p_new_content)) = 0 then
    raise exception 'Message content cannot be empty';
  end if;

  perform set_config('app.trusted_message_mutation', 'true', true);

  return query
  update public.group_messages
  set content = p_new_content,
      edited_at = now()
  where id = p_message_id
    and sender_id = auth.uid()
    and deleted_at is null
  returning *;

  if not found then
    raise exception 'Message not found, not yours, or already deleted';
  end if;
end;
$$;

grant execute on function edit_group_message(uuid, text) to authenticated;

create or replace function unsend_group_message(p_message_id uuid)
returns setof public.group_messages
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.trusted_message_mutation', 'true', true);

  return query
  update public.group_messages
  set content = null,
      deleted_at = now(),
      deleted_by = null
  where id = p_message_id
    and sender_id = auth.uid()
    and deleted_at is null
  returning *;

  if not found then
    raise exception 'Message not found, not yours, or already deleted';
  end if;
end;
$$;

grant execute on function unsend_group_message(uuid) to authenticated;

-- Admin-only moderation power, scoped to the Common Room. No equivalent
-- exists for private messages - admin has no business moderating a
-- conversation they're not part of.
create or replace function admin_delete_group_message(p_message_id uuid)
returns setof public.group_messages
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.members where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Only an admin can remove another member''s message';
  end if;

  perform set_config('app.trusted_message_mutation', 'true', true);

  return query
  update public.group_messages
  set content = null,
      deleted_at = now(),
      deleted_by = auth.uid()
  where id = p_message_id
    and deleted_at is null
  returning *;

  if not found then
    raise exception 'Message not found or already deleted';
  end if;
end;
$$;

grant execute on function admin_delete_group_message(uuid) to authenticated;
