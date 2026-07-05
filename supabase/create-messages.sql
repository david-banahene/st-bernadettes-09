-- Run this in Supabase SQL Editor
-- Adds direct 1:1 messaging between members ("Messages" feature).
-- No conversations table - at ~50 members, the inbox is built by grouping
-- a user's messages by "the other participant" in JavaScript.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.members(id) on delete cascade,
  recipient_id uuid not null references public.members(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_sender_idx on public.messages (sender_id, created_at);
create index messages_recipient_idx on public.messages (recipient_id, created_at);

alter table public.messages enable row level security;

-- Only the two participants in a conversation can see its messages
create policy "Participants can view their messages"
  on public.messages for select
  to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

-- You can only send messages as yourself
create policy "Members can send messages"
  on public.messages for insert
  to authenticated
  with check (sender_id = auth.uid());

-- The recipient can update a message (in practice: only to mark it read)
create policy "Recipient can mark read"
  on public.messages for update
  to authenticated
  using (recipient_id = auth.uid());

-- RLS restricts which ROWS can be updated, not which COLUMNS - without this
-- trigger, "Recipient can mark read" would technically also let a recipient
-- rewrite the message content they received. This pins every column except
-- read_at to its previous value on every update.
create or replace function protect_message_immutable_fields()
returns trigger as $$
begin
  new.content := old.content;
  new.sender_id := old.sender_id;
  new.recipient_id := old.recipient_id;
  new.created_at := old.created_at;
  return new;
end;
$$ language plpgsql;

create trigger trg_messages_protect_fields
  before update on public.messages
  for each row execute function protect_message_immutable_fields();

-- Enables live delivery via Supabase Realtime (same effect as the
-- Database > Replication toggle in the dashboard)
alter publication supabase_realtime add table public.messages;
