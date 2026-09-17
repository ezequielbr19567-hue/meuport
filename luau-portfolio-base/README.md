# Portfólio Roblox Studio — V12

Versão focada em **confiabilidade do conteúdo**, detecção automática de idioma e refinamento visual.

## V12 — correção do conteúdo padrão aparecendo raramente

A V11 escondia a página durante o carregamento, mas a API ainda podia devolver/aceitar a configuração padrão em uma falha temporária de Supabase. A V12 muda o comportamento:

- falha de banco não é mais tratada como conteúdo padrão;
- `/api/content` responde com erro temporário (`503`) em vez de trocar silenciosamente para o template;
- o navegador tenta carregar o conteúdo novamente várias vezes, com pequenos intervalos;
- as requisições do conteúdo usam `no-store` / `no-cache`;
- depois de um carregamento bem-sucedido, o navegador mantém uma cópia local do **último conteúdo válido**;
- se Supabase/Vercel tiver uma falha momentânea no futuro, o site usa essa última cópia válida em vez da configuração padrão;
- se for a primeira visita daquele navegador e não houver conexão nem cache válido, a tela de loading permanece e oferece **Tentar novamente / Retry** — o template padrão não é exibido por engano;
- quando a conexão volta após uso do cache, o site tenta atualizar silenciosamente para a versão mais recente.

## Idioma automático

Na primeira visita, sem uma escolha manual anterior:

- navegador em Português (`pt`, `pt-BR`, `pt-PT`) → site abre em **Português**;
- qualquer outro idioma → site abre em **English**.

O seletor `EN / PT` continua disponível. Se o visitante escolher manualmente um idioma, essa escolha passa a ter prioridade nas próximas visitas naquele navegador.

## Design

O visual vermelho/azul foi refinado sem adicionar imagens externas:

- mais profundidade e contraste no hero;
- colisão vermelho/azul mais sutil e coesa;
- menu continua transparente, sem a barra superior pesada;
- seletor de idioma menor e mais integrado;
- cards com microinterações e tratamento diferente para Builder e Systems;
- imagens continuam sem cortes (`contain`), com leve tratamento no hover;
- títulos de seção, preços, avaliações e CTA receberam detalhes mais consistentes;
- animações são suaves e respeitam `prefers-reduced-motion`.

## Recursos preservados

- Builder e Sistemas separados;
- EN/PT;
- `/dev` protegido por senha;
- Supabase;
- contador de visitas;
- jogos/Universe ID;
- avaliações com aprovação manual;
- média de estrelas apenas de avaliações aprovadas;
- upload de imagens por arquivo;
- imagens sem corte;
- vídeos de YouTube, Shorts, Live, Vimeo, Google Drive, Streamable e arquivos MP4/WEBM/OGG;
- contato público pelo Discord.

## Atualização

Não é necessário executar SQL novo nem alterar variáveis da Vercel. Substitua os arquivos da versão anterior pelos desta pasta e faça o deploy normalmente.
