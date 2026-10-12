const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.join(__dirname, '..');
function load(file) {
  const full = path.resolve(root, file), module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    if (name.startsWith('@/')) return load(name.slice(2) + '.ts');
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(full), name)) + '.ts');
    return require(name);
  }, module, module.exports);
  return module.exports;
}

const { safeExternalUrl, safeMediaUrl, safeEmailHref, videoSource } = load('lib/urls.ts');
const { isPortfolioContent } = load('lib/contentValidation.ts');
const { defaultPortfolio } = load('config/portfolio.ts');

const attacks = [
  'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\nscript:alert(1)',
  'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', 'blob:https://example.com/id',
  '//evil.example/x', '///evil.example/x', '/\\evil.example/x', '\\evil.example/x',
  'https:\\evil.example/x', 'https:evil.example', 'https:///evil.example',
  ' https://example.com', 'https://example.com ', 'https://example.com/a b',
  'https://exam\tple.com', 'https://example.com/\u0000file', 'https://example.com/\u007ffile',
  'https://example.com/%0aLocation:bad', 'https://example.com/%0D', '/%5Cevil.example/x',
  'https://youtube.com@evil.example/watch?v=dQw4w9WgXcQ', 'https://user:secret@example.com/a',
  'www.youtube.com/watch?v=dQw4w9WgXcQ', '', null, undefined, {}, 42,
];
for (const raw of attacks) {
  assert.equal(safeMediaUrl(raw), '', `media rejected ${JSON.stringify(raw)}`);
  assert.equal(safeExternalUrl(raw), '', `external rejected ${JSON.stringify(raw)}`);
  assert.equal(videoSource(raw).url, '', `video rejected ${JSON.stringify(raw)}`);
}
for (const raw of ['/a/..//evil.example/x', '/a/%2e%2e//evil.example/x']) {
  assert.equal(safeMediaUrl(raw), '', 'canonicalization cannot introduce a protocol-relative URL');
}
assert.equal(safeExternalUrl('HTTPS://EXAMPLE.COM/profile'), 'https://example.com/profile');
assert.equal(safeExternalUrl('http://localhost:3000/profile'), 'http://localhost:3000/profile');
assert.equal(safeExternalUrl('/projects/map.webp'), '');
assert.equal(safeMediaUrl('/projects/map%20one.webp'), '/projects/map%20one.webp');
assert.equal(safeMediaUrl('/projects/demo.mp4?version=2#t=3'), '/projects/demo.mp4?version=2#t=3');
assert.equal(safeMediaUrl('https://project.supabase.co/storage/v1/object/public/media/map.webp'), 'https://project.supabase.co/storage/v1/object/public/media/map.webp');
assert.equal(safeMediaUrl('https://example.com/' + 'a'.repeat(4096)), '');

for (const address of ['Simohayha931@hotmail.com', 'simoh+portfolio@example.com', 'mailto:simoh@example.com']) {
  assert.equal(safeEmailHref(address), address.startsWith('mailto:') ? address : `mailto:${address}`);
}
for (const address of ['mailto:simoh@example.com?bcc=other@example.com', 'simoh@example.com%0aBCC:x@y.com',
  'simoh@example.com\n', 'simoh@example.com#bad', '.simoh@example.com', 'simoh..x@example.com',
  'simoh@-example.com', 'simoh@example..com', 'javascript:alert(1)', '']) assert.equal(safeEmailHref(address), '');

assert.equal(videoSource('/projects/demo.mp4').kind, 'file');
assert.equal(videoSource('https://example.com/player?file=demo.mp4').kind, 'link');
assert.equal(videoSource('https://youtu.be/dQw4w9WgXcQ?t=3').url, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
assert.equal(videoSource('https://youtube.com/shorts/dQw4w9WgXcQ').url, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
assert.equal(videoSource('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ').kind, 'link');
assert.equal(videoSource('https://vimeo.com/123456/abc123').url, 'https://player.vimeo.com/video/123456?h=abc123');
assert.equal(videoSource('https://player.vimeo.com/video/123456?h=abc123').url, 'https://player.vimeo.com/video/123456?h=abc123');
assert.equal(videoSource('https://drive.google.com/file/d/abc_DEF-123/view').url, 'https://drive.google.com/file/d/abc_DEF-123/preview');
assert.equal(videoSource('https://streamable.com/e/abcd').url, 'https://streamable.com/e/abcd');

assert.equal(isPortfolioContent(defaultPortfolio), true, 'defaults remain loadable');
const legacyDefaults = structuredClone(defaultPortfolio);
legacyDefaults.links.email = 'mailto:seuemail@exemplo.com';
assert.equal(isPortfolioContent(legacyDefaults), true, 'the previous email placeholder remains valid during an upgrade');
const valid = structuredClone(defaultPortfolio);
valid.links.email = 'Simohayha931@hotmail.com';
valid.builderProjects[0].image = '/projects/map.webp';
valid.builderProjects[0].video = 'https://youtu.be/dQw4w9WgXcQ';
valid.games[0].manualVisits = 123;
valid.games[0].universeId = '123456789';
valid.owner.intro = 'Texto legado com <script> apenas como texto.';
assert.equal(isPortfolioContent(valid), true, 'legacy text and valid local/uploaded media remain supported');
const invalidChanges = [
  content => { content.links.roblox = 'javascript:alert(1)'; },
  content => { content.links.discord = '//evil.example'; },
  content => { content.links.email = 'mailto:test@example.com?bcc=x@example.com'; },
  content => { content.builderProjects[0].image = '/\\evil.example/a.png'; },
  content => { content.programmerProjects[0].video = 'data:text/html,evil'; },
  content => { content.games[0].url = 'javascript:alert(1)'; },
  content => { content.games[0].manualVisits = Infinity; },
  content => { content.games[0].manualVisits = -1; },
  content => { content.games[0].manualVisits = 0.5; },
  content => { content.games[0].universeId = '123&another=4'; },
  content => { content.media[0].url = 'https://example.com/%0a'; },
  content => { content.media[0].type = ['image']; },
  content => { content.owner.intro = 'x'.repeat(10001); },
  content => { content.builderSkills = Array(201).fill('Builder'); },
  content => { content.builderProjects = [null]; },
];
for (const change of invalidChanges) {
  const content = structuredClone(defaultPortfolio);
  change(content);
  assert.equal(isPortfolioContent(content), false, change.toString());
}

const { VideoPlayer, ImageViewer } = load('components/PortfolioMedia.tsx');
const facade = renderToStaticMarkup(React.createElement(VideoPlayer, { url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Demo', language: 'pt' }));
assert.match(facade, /Carregar vídeo/);
assert.doesNotMatch(facade, /<iframe|<video/, 'third-party players wait for user interaction');
const invalidVideo = renderToStaticMarkup(React.createElement(VideoPlayer, { url: 'javascript:alert(1)', title: 'Demo', language: 'en' }));
assert.match(invalidVideo, /Video unavailable/);
assert.doesNotMatch(invalidVideo, /href=|src=/);
const invalidImage = renderToStaticMarkup(React.createElement(ImageViewer, { src: '//evil.example/x', alt: 'Example', className: 'mediaImage', language: 'pt' }));
assert.match(invalidImage, /Imagem indisponível/);
assert.doesNotMatch(invalidImage, /<img/);
const image = renderToStaticMarkup(React.createElement(ImageViewer, { src: '/projects/map.webp', alt: '<script>bad()</script>', className: 'mediaImage', language: 'en' }));
assert.doesNotMatch(image, /<script>/, 'React escapes content rather than interpreting markup');
assert.match(image, /loading="lazy"/);

console.log('PASS media security: unsafe protocols, URL confusion, header injection, provider allowlist, bounded content, bilingual fallbacks and lazy embeds');
