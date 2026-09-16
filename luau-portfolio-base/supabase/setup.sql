-- Rode este arquivo no SQL Editor do seu projeto Supabase.

create table if not exists public.site_stats (
  id text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id, value)
values ('portfolio_visits', 0)
on conflict (id) do nothing;

alter table public.site_stats enable row level security;

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
