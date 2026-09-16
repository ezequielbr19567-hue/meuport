# Portfólio Roblox Studio — V5

Portfólio Next.js com foco em **Builder**, seção de programação separada, EN/PT, preços, mídia, jogos, contador de visitas, avaliações moderadas e modo desenvolvedor privado.

## Novidade da V5: upload de imagens por arquivo

Agora não é necessário hospedar imagens no ImgBB para os principais campos.

### Visitantes

No formulário de avaliação, a pessoa escolhe uma imagem diretamente do celular/computador. O site envia essa imagem ao **Supabase Storage**, cria a avaliação como `pending` e só mostra/conta a avaliação depois da sua aprovação.

- JPG, PNG, WEBP ou GIF.
- Limite: 3 MB por imagem.
- Ao excluir permanentemente uma avaliação pelo `/dev`, a imagem associada também é removida do Storage quando ela foi enviada pela V5.

### Modo desenvolvedor `/dev`

Você pode selecionar arquivos diretamente para:

- imagens dos projetos Builder;
- imagens dos projetos de programação;
- imagens na seção Mídia;
- imagens dos jogos/contribuições.

Para vídeos, continue usando URL de YouTube/Vimeo/MP4. Isso evita enviar vídeos grandes através da Vercel.

## Atualização da V4 para V5

Você **não precisa criar outro projeto Supabase** e não precisa alterar suas Environment Variables.

No Supabase, abra **SQL Editor → New query** e execute:

`supabase/add_storage.sql`

Esse SQL:

1. cria/atualiza o bucket público `portfolio-media`;
2. limita o bucket aos formatos de imagem aceitos;
3. adiciona `image_path` à tabela `portfolio_reviews` para permitir apagar o arquivo quando uma avaliação for excluída.

Depois substitua os arquivos no GitHub pela V5 e faça o deploy da Vercel.

## Environment Variables

As mesmas de antes:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...
```

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no GitHub ou navegador.

## Segurança do Storage

O bucket é público **somente para leitura das imagens**. Não existe policy pública de upload. Os uploads passam pelas rotas Next.js e a chave secreta fica no servidor.

## Estrutura principal

- `app/api/reviews/route.ts` — avaliações públicas + upload da imagem.
- `app/api/admin/upload/route.ts` — upload privado pelo `/dev`.
- `app/api/admin/reviews/route.ts` — moderação e exclusão.
- `lib/storage.ts` — lógica do Supabase Storage.
- `supabase/add_storage.sql` — upgrade V5.
