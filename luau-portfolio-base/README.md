# Portfólio Roblox Studio — V10

Versão com correções de mídia e acabamento do contato público.

## Ajustes desta versão

- Corrige vídeos na seção **Mídia** para links do YouTube normal, `youtu.be`, Shorts, Live, Embed, Vimeo, Google Drive, Streamable e arquivos MP4/WEBM/OGG.
- O campo **Vídeo opcional** dos projetos agora é realmente exibido no portfólio público.
- Imagens de projetos, mídia, jogos e avaliações passam a usar encaixe completo (`contain`) para evitar cortes mostrando apenas um canto da imagem.
- Mantém fundo escuro ao redor de imagens com proporções diferentes, em vez de cortar a imagem.
- Remove **Perfil Roblox** da área pública de contato; o contato fica somente pelo Discord.
- Mantém o botão de perfil Roblox no hero, separado da área de contato.
- Mantém EN/PT, avaliações, moderação, upload por arquivo, Supabase, contador e `/dev`.

Não é necessário executar SQL novo nem alterar variáveis da Vercel.

## Links de vídeo aceitos

Exemplos:

```text
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://www.youtube.com/live/VIDEO_ID
https://vimeo.com/123456789
https://drive.google.com/file/d/ARQUIVO/view
https://streamable.com/VIDEO_ID
https://site.com/video.mp4
```

Alguns vídeos do YouTube podem bloquear incorporação por configuração do próprio autor. Nesses casos, use outro vídeo ou um arquivo MP4 público.
