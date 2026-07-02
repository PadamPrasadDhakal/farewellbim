-- Run this once in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/cldsvijsoippqzxzdvrk/sql

create table if not exists events (
  id    bigint generated always as identity primary key,
  type  text        not null,
  page  text,
  data  jsonb       default '{}'::jsonb,
  ts    timestamptz default now()
);

-- Allow the anon/publishable key to insert and read
alter table events enable row level security;

create policy "allow insert" on events
  for insert to anon with check (true);

create policy "allow read" on events
  for select to anon using (true);

-- Invitation attempts table (testinvitation.html)
create table if not exists invitation_attempts (
  id            bigint generated always as identity primary key,
  entered_name  text        not null,
  matched_name  text,
  status        text        not null,   -- 'generated' | 'not_found' | 'downloaded'
  page          text,
  ts            timestamptz default now()
);

alter table invitation_attempts enable row level security;

create policy "allow insert attempts" on invitation_attempts
  for insert to anon with check (true);

create policy "allow read attempts" on invitation_attempts
  for select to anon using (true);
