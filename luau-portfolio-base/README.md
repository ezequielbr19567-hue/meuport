# Portfólio Luau / Roblox Studio — Base

Base de portfólio feita para você editar conteúdo sem precisar mexer na maior parte da programação.

## O que já existe

- Layout escuro e responsivo, com visual de developer portfolio.
- Efeito de luz seguindo o cursor.
- Seções: hero, números, projetos, jogos/contribuições, skills e contato.
- Contador real de visitas usando Supabase.
- Cada carregamento da página soma +1 ao contador.
- Integração-base com o endpoint público de detalhes de jogos do Roblox por Universe ID.
- Dados dos projetos e jogos centralizados em `config/portfolio.ts`.

## 1. Instalar e abrir

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## 2. O arquivo que você mais vai editar

Abra:

`config/portfolio.ts`

Ali você altera:

- seu nome e username;
- descrição;
- links do Roblox/GitHub/Discord;
- skills;
- projetos;
- jogos em que você contribuiu;
- Universe IDs.

## 3. Imagens

Coloque suas imagens em:

`public/projects/`

A base visual atual usa elementos abstratos e não depende das imagens. Isso foi proposital para o site funcionar mesmo antes de você adicionar screenshots. Você pode pedir à IA para transformar os cards em thumbnails reais usando o campo `image` que já existe na configuração.

## 4. Contador de visitas

Crie um projeto gratuito no Supabase.

No SQL Editor, execute:

`supabase/setup.sql`

Depois copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

IMPORTANTE: `SUPABASE_SERVICE_ROLE_KEY` é segredo. Nunca coloque essa chave em `config/portfolio.ts`, código client-side ou GitHub público.

O navegador chama `/api/visit`. O servidor é quem incrementa o banco. Portanto o número é compartilhado entre todos os visitantes.

### Pageviews x visitantes únicos

A base conta **entradas/carregamentos**. Atualizar a página conta novamente. Isso combina com a ideia de “entrei = +1”.

Se depois você quiser “visitantes únicos”, peça à IA para adicionar um sistema de sessão/cookie e analytics.

## 5. Jogos do Roblox

Em `config/portfolio.ts`, preencha o `universeId` de cada jogo:

```ts
{
  label: "Nome reserva",
  universeId: "1234567890",
  role: "Luau Scripter",
  contribution: "Implementei X, Y e Z.",
  url: "https://www.roblox.com/games/..."
}
```

O frontend envia os IDs para `/api/games`, e essa rota consulta os detalhes públicos do Roblox no servidor.

Deixei também `manualVisits`. Assim, enquanto um ID não estiver configurado, você pode colocar um número manual ou deixar `0`.

## 6. Publicar

O caminho mais simples para esta base é Vercel:

1. Suba o projeto para GitHub.
2. Importe no Vercel.
3. Adicione as duas variáveis de ambiente.
4. Deploy.
5. Depois conecte seu domínio.

Também dá para usar Replit ou pedir a uma IA de coding para adaptar a estrutura.

## Prompt útil para continuar desenvolvendo com IA

> Estou usando um portfólio Next.js + TypeScript para desenvolvimento Luau/Roblox Studio. Preserve `config/portfolio.ts` como fonte principal de conteúdo para que eu consiga trocar textos, projetos e Universe IDs sem editar componentes. Preserve `/api/visit` para o contador e `/api/games` para dados do Roblox. Antes de alterar a arquitetura, explique o que será mudado. Mantenha responsividade, performance, acessibilidade e nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no client.

## Ideias para a próxima evolução

- thumbnails automáticas dos jogos via Roblox;
- modal de projeto com vídeo/GIF;
- comparação before/after de sistemas;
- snippets Luau com syntax highlighting;
- timeline de experiência;
- filtros por tipo de projeto;
- visitantes únicos + analytics;
- painel admin privado para editar projetos sem mexer no código.
