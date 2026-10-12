-- Rode este arquivo no SQL Editor do seu projeto Supabase.

create table if not exists public.site_stats (
  id text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, value)
values ('portfolio_visits', 0)
on conflict (id) do nothing;

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_stats enable row level security;
alter table public.site_content enable row level security;

create or replace function public.increment_stat(stat_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_value bigint;
begin
  insert into public.site_stats (id, value, updated_at)
  values (stat_id, 1, now())
  on conflict (id)
  do update set
    value = public.site_stats.value + 1,
    updated_at = now()
  returning value into new_value;

  return new_value;
end;
$$;

revoke all on function public.increment_stat(text) from public;
revoke all on function public.increment_stat(text) from anon;
revoke all on function public.increment_stat(text) from authenticated;
grant execute on function public.increment_stat(text) to service_role;

-- Reviews / testimonials with approval workflow.
create extension if not exists pgcrypto;

create table if not exists public.portfolio_reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  identity_type text not null check (identity_type in ('roblox', 'discord', 'name')),
  rating smallint not null check (rating between 1 and 5),
  title text not null,
  description text not null,
  image_url text not null,
  image_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists portfolio_reviews_status_created_idx
  on public.portfolio_reviews (status, created_at desc);

alter table public.portfolio_reviews enable row level security;


-- V5: public bucket used only for reading uploaded portfolio images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
