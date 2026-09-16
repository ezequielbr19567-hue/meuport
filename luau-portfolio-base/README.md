# Portfolio Roblox Studio — V6 Final Polish

Versão refinada para publicação pública. Mantém tudo da V5 (EN/PT, Supabase, avaliações moderadas e upload de imagens), mas remove textos internos/instrutivos do site público e melhora a apresentação final.

## Mudanças da V6

- Textos públicos reescritos para parecerem conteúdo real de portfólio, não instruções ao dono.
- Builder continua como foco principal; programação permanece claramente separada.
- GitHub e e-mail removidos da área pública de contato.
- Contato público agora usa Discord + perfil Roblox.
- Link de modo desenvolvedor removido do rodapé público; o painel continua acessível em `/dev`.
- Seções de mídia e jogos ficam ocultas enquanto não houver conteúdo real configurado.
- Navegação acompanha isso e não mostra links para seções vazias.
- Navegação corrigida: “Contato” leva à CTA de contato, não à seção de skills.
- Pequeno polimento visual: header fixo discreto, divisores de seção, hover de cards e CTA final mais coesa.
- Migração automática de alguns textos-placeholder antigos salvos no Supabase para versões mais profissionais, sem substituir conteúdo personalizado.

## Atualização

Não precisa rodar novo SQL.

1. Substitua os arquivos da V5 pelos arquivos desta V6 no GitHub.
2. Faça commit.
3. Aguarde o deploy automático da Vercel ou faça Redeploy.
4. Suas variáveis de ambiente e dados do Supabase continuam os mesmos.

## Painel

O painel privado continua disponível em:

`/dev`

A senha continua sendo a variável `ADMIN_PASSWORD` da Vercel.
