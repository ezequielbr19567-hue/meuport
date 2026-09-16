# Portfólio Roblox Studio — Builder + Luau + Modo Desenvolvedor

Esta versão foi reorganizada para deixar **builder como foco principal**, com a parte de **programação separada**. O visual usa uma temática inspirada em contraste **vermelho x azul**, sem desenho/cartoon, com bordas mais quadradas e detalhes mais "industriais".

## O que esta versão já faz

- Builder em destaque na home.
- Programação em seção separada.
- Seção de **valores / preços** configurável.
- Seção de **mídia** para imagens e vídeos.
- Seção de **jogos/contribuições** com suporte a Universe ID do Roblox.
- Contador real de visitas usando Supabase.
- **Modo desenvolvedor privado** em `/dev` com senha.
- O modo dev salva no banco:
  - visitas,
  - textos,
  - preços,
  - imagens,
  - vídeos,
  - projetos,
  - jogos.

## Estrutura importante

- `config/portfolio.ts`
  - conteúdo padrão do site.
- `app/api/content`
  - conteúdo público do site.
- `app/api/admin/*`
  - login, sessão, salvar conteúdo e salvar visitas.
- `app/dev/page.tsx`
  - painel privado.
- `supabase/setup.sql`
  - SQL para criar tabelas.

## Publicar e configurar

### 1) No Supabase

Crie um projeto e rode o SQL em:

`supabase/setup.sql`

### 2) Na Vercel

Adicione estas variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=Tr19567!
```

> Segurança: a senha do modo desenvolvedor deve ficar em **Environment Variables** da Vercel, nunca no código do navegador.

### 3) Fazer deploy de novo

Depois de colocar as variáveis, faça um novo deploy.

## Como entrar no modo desenvolvedor

Abra:

```text
https://SEU-SITE.vercel.app/dev
```

Digite a senha configurada em `ADMIN_PASSWORD`.

## Como adicionar imagens e vídeos

No modo desenvolvedor, a seção **Mídia** aceita:

- `type: "image"` com uma URL pública de imagem.
- `type: "video"` com:
  - link do YouTube,
  - link do Vimeo,
  - ou URL direta `.mp4`.

## Observação importante

O site salva os dados principais no Supabase. Isso é necessário porque a Vercel **não salva arquivos localmente de forma permanente** entre execuções. Por isso o painel usa banco de dados, não arquivo JSON local.
