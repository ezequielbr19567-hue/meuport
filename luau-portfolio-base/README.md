# Portfólio Roblox Studio — V4

Portfólio com foco em **Builder**, área separada de **Luau / programação**, idiomas **English / Português**, painel privado e agora um sistema de **avaliações de 1 a 5 estrelas com moderação**.

## O que já existe

- English como idioma padrão + seletor EN/PT.
- Builder como foco principal.
- Programação em área separada.
- Valores / preços configuráveis.
- Imagens e vídeos.
- Jogos/contribuições com Universe ID do Roblox.
- Contador de visitas.
- Modo desenvolvedor em `/dev`.
- Conteúdo salvo no Supabase.
- Avaliações públicas de 1 a 5 estrelas.
- Nome do avaliador pode ser identificado como Roblox, Discord ou nome personalizado.
- Título do projeto obrigatório.
- Descrição e imagem do projeto.
- Toda avaliação entra como **pendente**.
- Só avaliações **aprovadas** aparecem no site.
- Só avaliações **aprovadas** entram na média mostrada no topo.
- No `/dev` você pode **aprovar, recusar, voltar para pendente ou excluir** uma avaliação.

## Atualizando da V3 para V4

Você NÃO precisa criar outro projeto Supabase e NÃO precisa trocar as variáveis da Vercel.

### 1. Rode a migration de avaliações

No mesmo projeto Supabase:

1. SQL Editor
2. New query
3. abra `supabase/add_reviews.sql`
4. copie todo o conteúdo
5. clique em Run

O SQL cria a tabela `portfolio_reviews`.

### 2. Atualize os arquivos no GitHub

Substitua os arquivos da pasta `luau-portfolio-base` pelos arquivos da V4 e faça commit.

### 3. Vercel

O deploy deve acontecer automaticamente. Se não acontecer:

`Deployments → Redeploy`

As variáveis continuam as mesmas:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...
```

## Como funciona uma avaliação

O visitante preenche:

- tipo de identidade: Roblox / Discord / nome personalizado;
- nick ou nome;
- 1 a 5 estrelas;
- título do projeto;
- descrição;
- URL pública da imagem do projeto.

Ao enviar:

```text
visitante envia
      ↓
status = pending
      ↓
NÃO aparece no site
NÃO entra na média
      ↓
/dev → você revisa
      ↓
Aprovar ──→ aparece + entra na média
Recusar ──→ fica oculto + não entra na média
Excluir ──→ removido permanentemente
```

## Média de estrelas

A média mostrada no topo usa apenas avaliações aprovadas. Exemplo:

```text
5 + 5 + 4 + 5 = 19
19 / 4 = 4.75
site mostra 4.8/5
```

Avaliações pendentes e recusadas são ignoradas.

## Segurança / moderação

O navegador não acessa a secret key do Supabase. As avaliações passam pelas rotas do servidor Next.js e o painel `/dev` exige sua sessão privada.

Existe também um campo invisível de honeypot para reduzir bots simples. A aprovação manual continua sendo a proteção principal contra spam e conteúdo indesejado.

## Imagens das avaliações

Nesta versão, a pessoa cola uma **URL pública direta** da imagem do projeto. Isso evita precisar configurar outro sistema de upload agora.

Depois é possível evoluir para upload direto de PNG/JPG no próprio formulário usando Supabase Storage.
