-- V4: sistema de avaliações/comentários com moderação.
-- Rode este arquivo UMA VEZ no SQL Editor do mesmo projeto Supabase.

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

-- Nenhuma policy pública é necessária: o navegador fala com as rotas Next.js,
-- e somente o servidor usa a secret key do Supabase.
