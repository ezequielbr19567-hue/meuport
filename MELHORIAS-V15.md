# V15 — projetos em destaque, contato e segurança

## O que mudou

- Nova direção visual com azul profundo, laranja e azul claro. Tipografia, espaçamento e hierarquia destacam o trabalho e o próximo passo do visitante.
- A imagem do primeiro projeto Builder com mídia aparece no hero. Sem foto cadastrada, uma ilustração vetorial decorativa ocupa o espaço; não é apresentada como captura de um trabalho real.
- Projetos com contribuição, desafio e resultado mantêm esses campos. A contribuição Builder aparece junto ao título.
- Removidos do hero os contadores de visitas, faixas de preço e espaços sem avaliações. A contagem de visitas continua no rodapé quando disponível.
- Seções vazias e seus links deixam de aparecer. Jogos sem destino válido são cartões sem link.
- Formulário de avaliação recolhido em um controle acessível. Vídeos continuam carregando apenas após interação.
- E-mail visível e copiável: **Simohayha931@hotmail.com**. Também aparece na recuperação de falha e no aviso sem JavaScript. E-mail vazio ou de exemplo em configurações antigas é atualizado na leitura; endereços personalizados válidos continuam editáveis no painel.
- Discord permanece visível quando configurado. Ações de serviço levam ao contato.
- A recuperação do carregamento continua funcionando com conteúdo padrão, salvo, cache ou falha. O limite de espera é reiniciado ao reconectar.
- O painel não entra no índice dos mecanismos de busca. Foram melhorados título e descrição de compartilhamento.

## Pesquisa aplicada

A proposta adapta técnicas de UX ao portfólio Builder/Luau. As fontes não prescrevem uma estética única, e técnicas conflitantes não foram aplicadas indiscriminadamente.

| Princípio | Aplicação | Referência |
| --- | --- | --- |
| Finalidade clara e próximo passo | Hero com especialidade e duas ações, trabalho em evidência | [NN/g: homepage](https://www.nngroup.com/articles/homepage-design-principles/) |
| Mostrar contribuição e processo | Campos de estudo de caso, contribuição visível e detalhes expansíveis | [NN/g: portfólios](https://www.nngroup.com/articles/ux-design-portfolios/) |
| Divulgação progressiva | Formulário de avaliação e detalhes de projeto sob demanda | [NN/g: progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) |
| Estrutura e operação acessíveis | Títulos, foco visível, teclado, menu com Escape e áreas de toque confortáveis | [W3C: estrutura](https://www.w3.org/WAI/tutorials/page-structure/), [alvos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| Legibilidade | Texto secundário mais contrastante e medidas responsivas | [W3C: contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) |
| Conteúdo rápido e estável | Imagem principal prioritária, dimensões reservadas, vídeos sob clique, sem biblioteca de animação | [web.dev: LCP](https://web.dev/articles/optimize-lcp), [CLS](https://web.dev/articles/optimize-cls) |

Não foram inventados clientes, projetos, métricas de resultado ou depoimentos. As prévias locais usam o conteúdo de exemplo e respostas simuladas. Seus dados reais continuam vindo do Supabase configurado na hospedagem.

## Segurança

- Sessões administrativas assinadas por HMAC, com valor aleatório e expiração validada pelo servidor em 12 horas.
- Cookies HttpOnly, SameSite Strict e Secure em produção. Sessões da versão anterior exigirão novo login.
- Proteção contra requisições de outros sites nas operações de escrita, tanto no middleware quanto nos leitores dos handlers.
- Limitação de tentativas de login, avaliações, visitas e operações administrativas, com respostas 429 e Retry-After.
- Limites reais no corpo de JSON e uploads, inclusive quando não há Content-Length.
- Uploads de até 3 MB verificam tipo e assinatura; a extensão é gerada pelo servidor. Arquivos com nome enganoso não são publicados como HTML.
- URLs aceitam protocolos apropriados: HTTP(S), mídia local e e-mail simples. Bloqueados scripts, URLs relativas a protocolo, credenciais embutidas e injeção de cabeçalhos no e-mail.
- Players externos limitados aos provedores suportados, com sandbox.
- Cabeçalhos CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy e HSTS em produção. APIs administrativas não são armazenadas em cache.
- Next.js atualizado para 15.5.27; overrides fixam PostCSS 8.5.29, sharp 0.35.5 e source-map-js 1.2.2.

Fontes: [OWASP: CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [Next: CSP](https://nextjs.org/docs/app/guides/content-security-policy).

## Validação realizada em 11/10/2026

- `npm test`: passou em regressão de conteúdo, idiomas, moderação, URLs/mídia e segurança.
- `npm run build`: passou, incluindo TypeScript e páginas de produção.
- `npm audit --omit=dev`: zero vulnerabilidades conhecidas na consulta realizada.
- Navegador Edge: cabeçalhos reais, acesso administrativo sem sessão, escrita de outra origem, dados padrão/salvos, cache, resposta lenta, falha e recuperação, idioma, menu, localStorage bloqueado, copiar e-mail, lightbox por teclado, vídeo sob clique e seções vazias.
- Layout sem rolagem horizontal em 320, 390, 768 e 1440 px; prévias desktop e celular revisadas visualmente.
- Combinações principais de texto/fundo medidas entre 4,61:1 e 9,06:1. Não é uma certificação de conformidade de todo o site.

Capturas: `previews/v15-desktop.png` e `previews/v15-mobile.png`.

## Publicar e manter

Use Node.js 22 atualizado, `npm ci`, `npm test` e `npm run build`. O site precisa de hospedagem com suporte a Next.js e suas APIs; o envio ao GitHub por si só não executa o servidor. GitHub Pages estático não atende ao painel e às APIs deste projeto.

As variáveis existentes continuam em uso: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) e ADMIN_PASSWORD. Nunca coloque as chaves privadas no GitHub.

Em hospedagem própria com proxy que altera Host, configure APP_ORIGIN com a origem pública. Só use TRUST_PROXY=true se o proxy sobrescrever X-Forwarded-For. A Vercel é identificada automaticamente.

O throttling é em memória por instância: reinícios e réplicas não compartilham contadores. Sem proxy confiável, usa contador compartilhado. Proteção distribuída contra abuso e DDoS depende da hospedagem/WAF. A validação de assinatura de arquivo não substitui antivírus. A CSP mantém unsafe-inline para compatibilidade com a hidratação das páginas estáticas do Next e não equivale a uma política estrita por nonce.

Os scripts SQL locais ativam RLS sem liberar escrita pública e restringem a função de contador à service_role. Não é necessária migração SQL para esta versão. As políticas efetivas do projeto remoto não foram inspecionadas; políticas permissivas criadas manualmente precisam ser verificadas no Supabase.

Imagens de avaliações usam o bucket público existente, inclusive antes da aprovação: quem já possuir a URL pode visualizá-las. Textos e metadados não são publicados antes da moderação. Privacidade completa de imagens pendentes requer bucket privado e URLs assinadas ou um fluxo separado de publicação.

Não foram usadas credenciais nem alterados dados de produção. A disponibilidade também depende da hospedagem, Supabase e rede.
