> Histórico da V12. Na V13, o fallback para configuração padrão durante falhas foi removido. Consulte `MELHORIAS-V13.md` para o comportamento atual.

# Portfólio V12 — revisão e pesquisa

## Entrega

O projeto mantém Next.js, React, Supabase, o painel em `/dev`, as seções e a composição visual da V11. A revisão troca o vermelho por laranja `#f5973e` e usa azul meia-noite `#08172e` como contraponto. Tons mais claros ficam reservados à legibilidade. A imagem fornecida é a marca do cabeçalho e o ícone do site; o arquivo original não foi retocado.

### Mobile e acessibilidade

- Menu disponível em telas até 1100 px, com estado anunciado, fechamento por seleção e Escape.
- Grades de projetos, vídeos, preços e avaliações em uma coluna no celular.
- Estatísticas compactas em duas colunas; tipografia fluida; campos de 16 px para evitar zoom automático em formulários no iOS.
- Controles principais de 44–48 px, foco visível, link para pular aos projetos e respeito a movimento reduzido.
- Imagens ampliáveis por toque e teclado em diálogo nativo; Escape fecha, foco retorna ao acionador e o fundo não rola.

A W3C recomenda que o conteúdo se reorganize sem exigir rolagem em duas direções a 320 CSS px. O mínimo geral de alvo na WCAG 2.2 é 24×24 CSS px, com exceções; adotamos dimensões maiores nos controles principais. Isso orienta a implementação, mas não equivale a uma certificação integral WCAG.
Fontes: [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

### Idioma

A ordem é: escolha manual salva → primeiro idioma compatível na lista de preferências do navegador → inglês. `pt-BR`, `pt-PT` e outras variantes de português usam PT; variantes de inglês usam EN. Exemplo: `fr-FR, pt-BR, en-US` seleciona português. A preferência manual persiste quando o navegador permite armazenamento. Se o armazenamento estiver bloqueado, o site continua funcionando. O atributo `lang` acompanha o idioma.

Não é possível saber com certeza o que uma pessoa lê a partir do navegador. Por isso, EN/PT continua visível. Não há geolocalização, coleta de IP para idioma nem serviço de tradução. Preencha as duas versões no painel; textos antigos que só existem em um idioma usam o fallback já existente.
Fonte: [MDN — navigator.languages](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages).

### Projetos que explicam o trabalho

Foram adicionados ao painel três campos opcionais e bilíngues: **Minha contribuição**, **Desafio e solução** e **Resultado / entrega**. No site, aparecem em “Sobre o projeto” apenas quando preenchidos. Conteúdo antigo continua compatível e não precisa de migração SQL: os campos vivem no JSON do portfólio.

A pesquisa da Nielsen Norman Group recomenda selecionar poucos trabalhos fortes, tornar a leitura rápida e mostrar problema, papel, decisões e resultados. A publicação trata de portfólios de UX; a adaptação para Roblox aqui é uma decisão editorial, não evidência específica de contratação de builders. Para o seu portfólio, selecione 3–5 projetos representativos, mostre exatamente sua parte e mantenha a apresentação curta.
Fonte: [NN/G — Design portfolios](https://www.nngroup.com/articles/ux-design-portfolios/).

Roteiro sugerido para cada projeto (preencha apenas com fatos):

1. **Capa:** melhor vista geral que permita entender o cenário em poucos segundos.
2. **Descrição:** o que foi construído e para qual tipo de experiência.
3. **Contribuição:** construção, iluminação, layout, scripting ou colaboração específica.
4. **Desafio:** uma restrição real e a decisão que você tomou.
5. **Resultado:** o que foi entregue; métricas somente se você puder comprová-las.
6. **Vídeo:** uma demonstração curta do ambiente ou sistema funcionando.

### Imagens e vídeos

Imagens de projetos e da galeria têm carregamento tardio, decodificação assíncrona, proporção reservada e ampliação sem recorte. Links quebrados nesses componentes mostram um estado de indisponibilidade. O cabeçalho usa a otimização de imagem do Next.js.

Os players de terceiros só são montados após clique/toque; vídeos locais usam `preload="none"`, controles e reprodução inline. Há um link para abrir o original caso a incorporação seja bloqueada pelo provedor. YouTube usa o domínio de privacidade aprimorada. Foram preservados YouTube/Shorts, Vimeo, Drive, Streamable e MP4/WebM/OGG; corrigida a interpretação de caminhos de mídia local e links Streamable `/e/`.

O web.dev recomenda evitar downloads desnecessários de vídeo e usar uma fachada antes de carregar embeds, porque os players adicionam recursos e trabalho de JavaScript. Imagens dimensionadas para o uso e formatos modernos reduzem bytes. Esta versão otimiza o comportamento de apresentação; não recomprime automaticamente todos os uploads do Supabase nem transforma mídia inexistente.
Fontes: [Video performance](https://web.dev/learn/performance/video-performance), [Image performance](https://web.dev/learn/performance/image-performance).

Recomendações editoriais para suas próximas capturas:

- Capture diretamente do Roblox Studio, sem barras e overlays desnecessários; inclua uma vista geral e detalhes que demonstrem seu trabalho.
- Exporte imagens em WebP/AVIF quando sua ferramenta permitir, verificando texturas e textos depois da compressão. Uma largura de 1600–1920 px costuma ser um bom ponto de partida para a versão ampliável; ajuste ao conteúdo.
- Grave vídeos curtos, com movimento estável e objetivo. Para sistemas, mostre entrada, comportamento e resultado. Não dependa de áudio para explicar a demonstração; inclua legendas quando houver fala.
- Se hospedar MP4 diretamente, use H.264 e fast-start. Para muitos vídeos, prefira um serviço com adaptação de qualidade.
- Não substitua suas obras por renders genéricos ou imagens geradas que possam ser confundidas com projetos entregues.

O ZIP recebido não contém capturas nem vídeos reais dos projetos: os campos de mídia estão vazios e vários textos são exemplos. Por isso, não foi possível melhorar a resolução ou a edição do material original. A infraestrutura e a apresentação foram melhoradas para receber esse material.

### Avaliações

A nota não começa pré-selecionada em cinco estrelas. O visitante precisa escolher; botões anunciam a seleção. A foto é opcional, com validação de tipo e limite de 3 MB. Nome, projeto e relato continuam obrigatórios. Envio duplicado é bloqueado enquanto a requisição está em andamento. Sucesso e erro são anunciados; o campo de arquivo é limpo após sucesso.

O site mostra estado sem avaliações, indisponibilidade e orientação sobre moderação. A média considera avaliações aprovadas, como antes. O texto esclarece que nomes são informados pelos autores, sem verificação de identidade. A data aparece nos relatos publicados. Não foram criadas avaliações fictícias. O esquema existente aceita foto ausente como string vazia, sem migração SQL.

A pesquisa de credibilidade da NN/G destaca transparência e informação concreta; participantes também manifestaram maior confiança em fontes externas que em depoimentos selecionados pelo próprio fornecedor. A aplicação aqui é explicitar a moderação e não rotular autores como “verificados” sem autenticação. Relatos devem descrever o projeto e a experiência; permita críticas legítimas. Modere spam, dados privados e conteúdo abusivo com critérios consistentes, não apenas pela nota.
Fonte: [NN/G — Trustworthiness in web design](https://www.nngroup.com/articles/trustworthy-design/).

O mecanismo preserva o honeypot e a aprovação pelo painel. Não inclui autenticação Roblox/Discord nem proteção distribuída contra abuso. Para tráfego público elevado, configure limitação de requisições na hospedagem ou proteção antispam com validação no servidor.

### Confiabilidade

A tela de carregamento deixa de esperar visitas, jogos e avaliações. Só aguarda idioma e conteúdo, com limite de seis segundos para a busca de conteúdo e fallback para a configuração local. Corrigida a limpeza do temporizador da animação de saída. APIs secundárias podem atualizar depois. A consulta de avaliações também tem timeout e estado de falha. O efeito de cursor é desativado em dispositivos de toque e com movimento reduzido.

## Instalação e publicação

1. Use Node.js compatível com Next.js 15 e execute `npm ci`.
2. Copie `.env.example` para `.env.local` e configure as mesmas variáveis usadas no seu site atual. Nenhuma credencial foi incluída nesta entrega.
3. Execute `npm run dev` para revisar. Para produção: `npm run build` e `npm start`.
4. Abra `/dev`, entre com a senha administrativa e mantenha as configurações salvas no seu Supabase. Para instalação nova, siga os scripts de `supabase/` e o README original.
5. Revise nome, links Roblox/Discord, preços e exemplos antes de publicar; o ZIP original contém placeholders.
6. Preencha os novos campos nos dois idiomas e teste seus próprios vídeos, pois cada serviço controla permissões de incorporação.

Esta entrega é o código revisado. Nenhum site foi publicado e nenhum banco de dados externo foi alterado. Testes locais e suas limitações estão em `VALIDACAO.md`.
