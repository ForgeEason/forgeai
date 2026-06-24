create extension if not exists pgcrypto;

create table if not exists public.ai_level_7d_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  contact text,
  profession text,
  level integer,
  composite integer,
  norms jsonb not null default '{}'::jsonb,
  flags jsonb not null default '[]'::jsonb,
  answers jsonb not null default '[]'::jsonb
);

alter table public.ai_level_7d_submissions enable row level security;

drop policy if exists "anyone can insert ai level 7d submissions" on public.ai_level_7d_submissions;
create policy "anyone can insert ai level 7d submissions"
on public.ai_level_7d_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "admins can read ai level 7d submissions" on public.ai_level_7d_submissions;
create policy "admins can read ai level 7d submissions"
on public.ai_level_7d_submissions
for select
to authenticated
using (
  auth.jwt() ->> 'email' in (
    'your-email@example.com'
  )
);

drop policy if exists "admins can delete ai level 7d submissions" on public.ai_level_7d_submissions;
create policy "admins can delete ai level 7d submissions"
on public.ai_level_7d_submissions
for delete
to authenticated
using (
  auth.jwt() ->> 'email' in (
    'your-email@example.com'
  )
);

create index if not exists ai_level_7d_submissions_created_at_idx
on public.ai_level_7d_submissions (created_at desc);

create index if not exists ai_level_7d_submissions_level_idx
on public.ai_level_7d_submissions (level);

comment on table public.ai_level_7d_submissions is 'Forge 7维AI段位测评提交数据。上线前请把 RLS 策略中的 your-email@example.com 替换为管理员邮箱。';
