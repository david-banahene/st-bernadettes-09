-- Run this in Supabase SQL Editor
-- Adds a single shared Group Chat room ("The Common Room") alongside the
-- existing private 1:1 Messages feature. One flat table, no recipient_id
-- (broadcasts to everyone). Unread is tracked via the existing
-- content_updates/user_section_reads badge system instead of a bespoke
-- per-recipient count, since a group room's "anything new since I last
-- looked" is a single shared timestamp - exactly the case that system was
-- built for (see create-notification-badges.sql).

create table public.group_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.members(id) on delete cascade,
  content text,
  reply_to_id uuid references public.group_messages(id) on delete set null,
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now()
);
-- content is nullable (unlike messages.content) because a soft-deleted row
-- nulls it out; the insert path always supplies non-null content in
-- practice (enforced app-side).

create index group_messages_created_idx on public.group_messages (created_at);

alter table public.group_messages enable row level security;

-- Every authenticated member can read every message - it's one shared room
create policy "Anyone can view group messages"
  on public.group_messages for select
  to authenticated
  using (true);

-- Every authenticated member can post as themselves - unlike Announcements,
-- this is NOT leader-gated; anyone can send and anyone can reply.
create policy "Members can post group messages"
  on public.group_messages for insert
  to authenticated
  with check (sender_id = auth.uid());

-- No UPDATE policy at all, deliberately: raw client .update() calls are
-- flatly rejected by RLS's default-deny. Edit / unsend / admin-delete are
-- only possible through security-definer RPCs (add-message-actions-rpcs.sql),
-- which bypass RLS and enforce their own authorization.

-- Same trusted-mutation escape hatch pattern as messages' trigger (see
-- add-message-edit-reply.sql) - defense in depth, even though there's no
-- ordinary client UPDATE path to begin with here.
create or replace function protect_group_message_immutable_fields()
returns trigger as $$
begin
  if current_setting('app.trusted_message_mutation', true) = 'true' then
    return new;
  end if;

  new.sender_id := old.sender_id;
  new.created_at := old.created_at;
  new.content := old.content;
  new.edited_at := old.edited_at;
  new.deleted_at := old.deleted_at;
  new.deleted_by := old.deleted_by;
  return new;
end;
$$ language plpgsql;

create trigger trg_group_messages_protect_fields
  before update on public.group_messages
  for each row execute function protect_group_message_immutable_fields();

-- Enables live delivery via Supabase Realtime
alter publication supabase_realtime add table public.group_messages;

-- ============================================================
-- Badge integration: register "group-chat" as a tracked section in the
-- universal notification badge system (see
-- fix-notification-badges-universal.sql) so the existing Messages nav
-- badge dot also lights up for new group activity. Only INSERT bumps this -
-- edits/unsends must never re-trigger it, or every edit would falsely
-- re-surface the badge for everyone who already read the room.
-- ============================================================

insert into content_updates (section, last_updated_at) values
  ('group-chat', now())
on conflict (section) do nothing;

-- Reuses the existing bump_section_update() function (already shipped in
-- create-notification-badges.sql, parameterized by TG_ARGV[0]) rather than
-- duplicating its logic.
create or replace trigger trg_group_chat_update
  after insert on public.group_messages
  for each row execute function bump_section_update('group-chat');
