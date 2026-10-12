-- V5: storage para uploads de imagens.
-- Rode UMA VEZ no SQL Editor do mesmo projeto Supabase.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.portfolio_reviews
  add column if not exists image_path text;

-- Não criamos policies públicas de upload.
-- Uploads passam pelas rotas Next.js e usam a secret key somente no servidor.
