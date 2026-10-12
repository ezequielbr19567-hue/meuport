# V14 — abertura com conteúdo padrão e apresentação dos projetos

## Bugs e resiliência

- A API pública agora distingue `default` (instalação sem Supabase ou consulta que confirmou ausência de conteúdo) de `saved` (conteúdo publicado). Ambos abrem o site, mesmo se os valores salvos forem iguais ao padrão.
- Uma falha de banco ou conteúdo inválido continua retornando 503: não é interpretada como ausência de personalização. O painel de edição permanece protegido contra salvar uma base por cima de dados que falharam ao carregar.
- A última versão salva e validada pode abrir pelo cache local por até sete dias. Conteúdo padrão não é gravado como personalização; uma resposta padrão confirmada limpa o cache antigo.
- O carregamento oferece recuperação após 14 segundos; requisições têm limite individual e até três tentativas. É possível tentar novamente manualmente e ao reconectar.
- Jogos e visitas têm limites de espera, e respostas antigas de jogos não sobrescrevem a configuração atual. Envio de avaliação tem limite de 20 segundos.
- Uma falha de renderização apresenta uma tela de recuperação. Corrigida também a migração de textos cuja substituição intencional é vazia.

## Design e contato

- Mantidas as cores laranja e azul, o fundo escuro e as áreas Builder/Luau.
- A abertura destaca a primeira imagem cadastrada em projetos Builder, carregada com prioridade. Na ausência de imagem, mostra uma composição geométrica em CSS, sem apresentar uma imagem gerada como trabalho real.
- Tipografia com melhor legibilidade, seções numeradas, grade de projetos reorganizada e cartões de serviço com chamada para contato.
- Status personalizado volta a aparecer. Links de exemplo do Roblox e Discord deixam de parecer contatos funcionais.
- Contato orienta o visitante a enviar referência, escopo e prazo. Conteúdo personalizado permanece no armazenamento existente.

## Pesquisa aplicada

- [Nielsen Norman Group — Homepage usability](https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/): identidade clara, pontos de entrada e hierarquia. Aplicado no hero, nas seções e nas chamadas de contato.
- [Nielsen Norman Group — Trustworthy design](https://www.nngroup.com/articles/trustworthy-design/): qualidade visual e informação relevante para credibilidade. Aplicado na apresentação dos projetos reais, sem inventar resultados ou avaliações.
- [web.dev — Optimize resource loading](https://web.dev/learn/performance/optimize-resource-loading): priorizar recursos necessários e controlar custo de JavaScript. A mídia principal recebe prioridade; vídeos continuam carregando sob interação, sem adicionar bibliotecas visuais.

## Validação e operação

Execute `npm ci`, `npm test` e `npm run build`. A suíte `tests/browser.cjs` usa Playwright instalado no ambiente; `PLAYWRIGHT_CHANNEL=msedge` permite usar o Edge instalado. Ela testa falhas transitórias, cache, primeira visita sem cache, respostas lentas, dados padrão, bloqueio de localStorage, idiomas, menu, dimensões 320/390/768/1440 e proteção do painel.

As capturas `previews/v14-desktop.png` e `previews/v14-mobile.png` usam conteúdo de exemplo e APIs simuladas, não representam seus dados de produção.

Não exige migração SQL nem novas variáveis. Para publicar as alterações, é necessário implantar esta versão na hospedagem existente. A disponibilidade também depende da hospedagem, do Supabase e da rede; estas mudanças não garantem disponibilidade absoluta. Em uma primeira visita durante indisponibilidade do banco, sem cache confirmado, aparece recuperação em vez de dados possivelmente errados.
