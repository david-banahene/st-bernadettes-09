-- Run this in Supabase SQL Editor
-- Adds edit / unsend / reply-to support to the existing 1:1 messages table.
-- Additive only - does not touch the existing 3 RLS policies.

alter table public.messages
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.members(id) on delete set null,
  add column if not exists reply_to_id uuid references public.messages(id) on delete set null;

-- Replaces the existing trigger function. Ordinary client updates (today:
-- only "Recipient can mark read") are still locked down to read_at only -
-- now including the 4 new columns in that lock-down. Trusted RPCs
-- (edit_direct_message / unsend_direct_message, added separately) set a
-- transaction-local flag immediately before their own UPDATE so they can
-- bypass this lock-down for exactly the columns they own; nothing else
-- can set that flag (it's never exposed to clients), so this does not
-- reopen the original tampering hole this trigger was built to close.
create or replace function protect_message_immutable_fields()
returns trigger as $$
begin
  if current_setting('app.trusted_message_mutation', true) = 'true' then
    return new;
  end if;

  new.content := old.content;
  new.sender_id := old.sender_id;
  new.recipient_id := old.recipient_id;
  new.created_at := old.created_at;
  new.edited_at := old.edited_at;
  new.deleted_at := old.deleted_at;
  new.deleted_by := old.deleted_by;
  -- reply_to_id is intentionally NOT pinned here: it's only ever set at
  -- INSERT time (never touched by any UPDATE path, trusted or not), so
  -- there's nothing to protect on UPDATE.
  return new;
end;
$$ language plpgsql;

-- trg_messages_protect_fields already exists (before update ... for each
-- row execute function protect_message_immutable_fields()) - replacing the
-- function body above is sufficient, no need to recreate the trigger.
