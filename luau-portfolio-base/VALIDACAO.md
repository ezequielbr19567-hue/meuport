# Validação — V12

Verificações realizadas em 17/09/2026:

| Verificação | Resultado |
|---|---|
| TypeScript (`npx tsc --noEmit`) | Passou |
| Compilação de produção (`npm run build`) | Passou, sem avisos de compilação |
| Chromium, larguras 320, 375, 390, 768, 1024 e 1440 px | Sem rolagem horizontal da página |
| Menu mobile, seleção de seção | Abre e fecha corretamente |
| Idioma pt-BR, troca EN/PT e recarga | Detecta português e mantém a escolha manual |
| Imagem ampliada, diálogo e Escape | Passou com imagem local de teste |
| Vídeo incorporado | Iframe ausente antes do clique e presente depois |
| Detalhes do projeto | Campos opcionais renderizados e expansíveis |
| Avaliação sem imagem | Interface envia e mostra sucesso com API simulada |
| Falha das APIs de avaliações/visitas | Não bloqueia o portfólio |
| Armazenamento local bloqueado | Detecção de idioma continua funcionando |
| Função de idioma | Testados pt-PT, en-GB, preferência manual e fallback |
| Normalização de vídeo | Testados MP4 local, YouTube e Streamable /e/ |
| Rota POST de avaliações | Testada diretamente com Supabase simulado: foto opcional, status pendente, rejeição de nota, texto, identidade e arquivo inválidos |

A primeira rodada encontrou overflow causado pelos brilhos decorativos; corrigido com contenção horizontal da decoração. As verificações de largura passaram depois da correção. Prévia mobile em `previews/preview-390.png` e desktop em `previews/preview-1440.png`, ambas inspecionadas visualmente.

## Reproduzir

```sh
npm ci
npm test
npm run build
```

Teste opcional de navegador, em ambiente com Chromium disponível:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/browser.cjs
```

O teste de navegador inicia a versão de produção local na porta 3000, testa a interface e encerra o servidor. Deixe a porta livre. O teste de mídia injeta fixtures apenas no navegador; não altera o conteúdo salvo. Os arquivos de prévia adicionais vão para `tests/previews/`.

## Limites do que foi validado

- Não houve acesso a credenciais reais do Supabase. Upload, persistência, autenticação administrativa e aprovação em produção precisam ser verificados com seu ambiente configurado.
- Os testes de formulário usam respostas simuladas; o teste direto da rota usa um cliente Supabase simulado.
- A incorporação foi verificada até a criação do player. Reprodução e permissões de cada vídeo externo dependem do provedor e dos seus links.
- Chromium com viewport redimensionado não substitui testes em aparelhos iOS/Android reais. Safari, Firefox, teclado virtual, leitor de tela e rede móvel não foram auditados integralmente.
- Não foi feita medição Lighthouse/Core Web Vitals em produção nem prometido ganho numérico de velocidade.
- As prévias usam a configuração de exemplo do ZIP original. Não representam seus projetos reais nem dados do seu site publicado.
- Nenhum deploy, alteração remota de banco ou envio de mensagem foi realizado.
