# Validação V13 — 18/09/2026

## Resultados

- TypeScript e compilação de produção: aprovados.
- Testes anteriores de idioma, URLs de mídia e validação de avaliações: aprovados.
- Falha de consulta ao banco: lança erro, sem retorno de conteúdo padrão.
- Banco sem configuração e ausência de conteúdo: página pública não recebe exemplos.
- Instalação nova: configuração inicial permitida somente ao painel após leitura bem-sucedida sem registro.
- API pública: 503 em falha, sem conteúdo no corpo e com no-store; resposta válida identificada como salva.
- Cache local inválido, expirado ou bloqueado: tratado sem quebra da aplicação.
- Migração de texto legado: preserva texto personalizado em inglês e português.
- Navegador Chromium: duas respostas 503 seguidas de sucesso recuperam automaticamente. Observação do DOM não detectou exibição do username padrão.
- Navegador: recarga offline preserva conteúdo confirmado e mostra aviso.
- Navegador: sem cache, falha persistente mostra recuperação; botão de nova tentativa recupera o conteúdo.
- Navegador: resposta atrasada em 6,8 segundos carrega as configurações sem fallback padrão.
- Navegador: larguras 320, 390, 768 e 1440 px sem rolagem horizontal.
- Painel: falha impede acesso ao formulário de salvamento; nova tentativa restaura a edição.
- Painel: salvar conteúdo sem editar visitas não envia escrita ao contador.
- Nenhum erro JavaScript de página nos cenários executados.

## Reproduzir

```sh
npm ci
npm test
npm run build
```

Opcional, para as simulações no navegador:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/browser.cjs
```

O script inicia o servidor local na porta 3000 e o encerra ao final. Use uma porta livre. Os dados e respostas de rede são simulados apenas durante os testes; não gravam no Supabase real.

## Limitações

Não houve acesso a logs de produção, hospedagem ou credenciais reais. Persistência e uploads no Supabase real não foram testados. Chromium não substitui testes em aparelhos móveis e Safari reais. As prévias PNG do pacote são da V12 e documentam o visual preservado; os estados novos foram verificados por testes de navegador nesta versão. Não foi realizado deploy.
