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
