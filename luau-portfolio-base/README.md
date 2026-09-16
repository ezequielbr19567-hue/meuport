# Portfolio Roblox Studio — V3 EN/PT

V3 do portfólio com foco principal em **Builder**, programação em seção separada, painel privado e troca de idioma **English / Português**.

## O que mudou na V3

- O site público abre em **English** por padrão.
- Seletor discreto `EN / PT` no topo.
- A escolha de idioma fica salva no navegador para visitas futuras.
- O painel `/dev` permite editar o conteúdo em **English** e **Português** separadamente.
- Projetos, preços, skills, mídia, jogos, descrições e textos principais suportam os dois idiomas.
- URLs, imagens, vídeos, Universe IDs e contador de visitas continuam compartilhados.
- Conteúdo salvo pela V2 continua aceito; a V3 faz uma migração compatível ao carregar.
- A sessão do modo desenvolvedor não grava mais a senha pura no cookie.

## Atualização a partir da V2

Não é necessário recriar o Supabase e não é necessário rodar SQL novo.

1. Substitua os arquivos da V2 pelos arquivos desta V3 no GitHub.
2. Faça o commit.
3. A Vercel deve criar um novo deploy automaticamente. Se não criar, faça um Redeploy.
4. Mantenha as mesmas Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_SECRET_KEY
ADMIN_PASSWORD=YOUR_PRIVATE_PASSWORD
```

Também é aceito `SUPABASE_SECRET_KEY` no lugar de `SUPABASE_SERVICE_ROLE_KEY`.

## Idioma

Primeiro acesso: `English`.

O seletor fica no header:

```text
EN / PT
```

Quando o visitante escolhe um idioma, a escolha é salva no `localStorage` do navegador.

## Modo desenvolvedor

Abra:

```text
https://SEU-SITE.vercel.app/dev
```

Depois do login, use a barra:

```text
Editando conteúdo:  English  Português
```

Troque o idioma, edite os campos e clique em **Salvar tudo**.

### Editável no painel

- visitas;
- nome e username;
- hero e textos principais;
- links;
- skills Builder e Programming;
- projetos Builder;
- projetos de programação;
- preços/pacotes;
- imagens e vídeos por URL;
- jogos, Universe IDs e contribuições.

## Supabase

A V3 usa as mesmas tabelas da V2:

- `site_stats`
- `site_content`

Se você já configurou a V2 e ela funciona, não precisa mexer no SQL.

## Segurança

Nunca coloque sua chave `sb_secret_...` ou a senha real do painel no GitHub.

A chave secreta e `ADMIN_PASSWORD` devem ficar apenas em **Vercel → Environment Variables**.
