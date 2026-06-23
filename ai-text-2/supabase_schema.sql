create extension if not exists pgcrypto;

create table if not exists public.ai_level_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  organization text not null default 'Forge 锻造AI训战营',
  participant jsonb not null default '{}'::jsonb,
  role_key text,
  role_name text,
  result jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  duration_ms integer,
  answers jsonb not null default '[]'::jsonb,
  user_agent text
);

alter table public.ai_level_submissions enable row level security;

drop policy if exists "participants can insert submissions" on public.ai_level_submissions;
create policy "participants can insert submissions"
on public.ai_level_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "admins can read submissions" on public.ai_level_submissions;
create policy "admins can read submissions"
on public.ai_level_submissions
for select
to authenticated
using (
  auth.jwt() ->> 'email' in (
    'your-email@example.com'
  )
);

drop policy if exists "admins can delete submissions" on public.ai_level_submissions;
create policy "admins can delete submissions"
on public.ai_level_submissions
for delete
to authenticated
using (
  auth.jwt() ->> 'email' in (
    'your-email@example.com'
  )
);

create index if not exists ai_level_submissions_created_at_idx
on public.ai_level_submissions (created_at desc);

create index if not exists ai_level_submissions_result_level_idx
on public.ai_level_submissions (((result ->> 'level')));

comment on table public.ai_level_submissions is 'Forge AI LEVEL 测评提交数据。请把策略中的 your-email@example.com 替换为管理员邮箱。';
