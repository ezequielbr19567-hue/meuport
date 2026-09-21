# V13 — configurações confiáveis e proteção da edição

## Problema encontrado

Havia dois caminhos confirmados no código que exibiam exemplos no lugar das configurações:

1. O servidor devolvia `defaultPortfolio` quando o Supabase falhava, estava sem configuração ou não retornava conteúdo. A API respondia 200, indistinguível de uma leitura válida.
2. O navegador começava com `defaultPortfolio` e encerrava o carregamento mesmo quando a consulta falhava ou ultrapassava seis segundos.

Não tivemos acesso aos logs ou credenciais do site publicado para identificar qual desses caminhos causou cada ocorrência relatada. Ambos foram corrigidos e reproduzidos em testes controlados.

## Comportamento novo

- A API pública só devolve conteúdo confirmado como salvo. Erro, banco sem configuração ou ausência de publicação produzem resposta 503, sem exemplos no corpo.
- Respostas de conteúdo têm `Cache-Control: no-store` e a consulta do navegador também evita cache HTTP. Isso reduz o risco de uma camada intermediária reaproveitar uma resposta antiga.
- O navegador verifica status HTTP, origem declarada e formato dos dados antes de exibi-los.
- Há até três tentativas por ciclo, com pausas curtas entre elas. A consulta ao banco tem limite de dez segundos; cada tentativa do navegador tem limite de doze segundos.
- A última configuração pública confirmada fica no navegador por até sete dias como recurso de recuperação. Ao abri-la, o site busca novamente a versão atual e informa quando está usando a última versão disponível. Falhas nunca substituem essa cópia pelos exemplos.
- Em uma primeira visita sem cópia válida, uma falha persistente mostra mensagem e botão para tentar novamente. Não mostra o portfólio padrão.
- Ao receber o evento de retorno da conexão, o site inicia outra tentativa. Requisições e temporizadores são cancelados quando o componente é desmontado.
- Navegadores com armazenamento bloqueado continuam funcionando com consulta direta. Sem conexão e sem cópia válida, mostram a recuperação.

A cópia local não é backup do banco, não é garantia de atualização enquanto offline e não contém credenciais. É uma cópia do conteúdo público já recebido. Se o banco permanecer indisponível, nenhum código no navegador consegue buscar uma versão que ainda não recebeu.

## Melhorias gerais

### Painel mais seguro

Uma falha de leitura bloqueia a edição e apresenta “Tentar novamente”. O painel só oferece a configuração inicial quando uma consulta bem-sucedida confirma que ainda não existe registro, permitindo instalações novas. Falhas de rede não são confundidas com uma instalação vazia.

Estatísticas e avaliações falhando não substituem o conteúdo já carregado. O salvamento valida a estrutura no servidor. Erros preservam as edições na tela, e o navegador avisa antes de sair com alterações não salvas.

“Salvar tudo” não regrava mais o contador de visitas sem alteração explícita: antes, o valor lido ao abrir o painel podia apagar visitas novas acumuladas enquanto se editava o conteúdo. Se o conteúdo for salvo e o contador falhar, a mensagem informa esse resultado parcial.

### Conteúdo preservado entre idiomas

Textos antigos salvos como uma única string agora mantêm esse texto como fallback nos dois idiomas. Antes, a migração podia introduzir o texto de exemplo em inglês. Isso não traduz automaticamente os textos: as traduções específicas continuam editáveis no painel.

### Visual

Paleta, logo, layout, mídia e melhorias mobile da V12 foram preservados. Foram acrescentados somente o estado de recuperação e o aviso discreto de atualização da cópia local.

## Aplicar

1. Substitua o código da versão anterior pelo conteúdo deste pacote.
2. Mantenha as variáveis de ambiente e o mesmo projeto Supabase usados no site atual.
3. Execute `npm ci`, `npm test` e `npm run build`.
4. Publique pela sua hospedagem habitual. Não há migração SQL nesta versão e os dados existentes não precisam ser recadastrados.
5. Em instalação nova, configure o Supabase e salve o conteúdo em `/dev` antes de divulgar a página pública.

Nenhum deploy nem alteração do banco real foi realizado nesta entrega. O pacote não inclui credenciais. O comportamento com falhas foi validado com simulações; veja `VALIDACAO-V13.md`.
