const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const module = {exports:{}};
  new Function('require','module','exports',code)(name => name in mocks ? mocks[name] : require(name), module, module.exports);
  return module.exports;
}
(async () => {
  const {detectLanguage} = load('lib/i18n.ts');
  assert.equal(detectLanguage(null,['pt-PT','en-US']),'pt');
  assert.equal(detectLanguage(null,['fr-FR','en-GB','pt-BR']),'en');
  assert.equal(detectLanguage('en',['pt-BR']),'en');
  assert.equal(detectLanguage(null,['ja-JP']),'en');
  const {videoSource} = load('components/PortfolioMedia.tsx');
  assert.equal(videoSource('/projects/demo.mp4').kind,'file');
  assert.equal(videoSource('https://youtu.be/dQw4w9WgXcQ').url,'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(videoSource('https://streamable.com/e/abcd').url,'https://streamable.com/e/abcd');
  let inserted;
  const {POST} = load('app/api/reviews/route.ts', {
    '@/lib/supabaseAdmin': {getAdminClient: () => ({from: () => ({insert: async value => {inserted=value;return {error:null};}})})},
    '@/lib/storage': {REVIEW_IMAGE_TYPES: new Set(['image/png']),uploadPublicMedia:async()=>({url:'https://example.com/photo.png',path:'photo.png'}),deletePublicMedia:async()=>{}}
  });
  function request(values={}) {
    const form = new FormData();
    for (const [key,value] of Object.entries({displayName:'Test',identityType:'name',rating:'4',title:'Map',description:'Delivered map',...values})) form.set(key,value);
    return new Request('http://localhost/api/reviews',{method:'POST',body:form});
  }
  assert.equal((await POST(request())).status,200);
  assert.equal(inserted.status,'pending');
  assert.equal(inserted.image_url,'');
  assert.equal((await POST(request({rating:'0'}))).status,400);
  assert.equal((await POST(request({description:'   '}))).status,400);
  assert.equal((await POST(request({identityType:'invalid'}))).status,400);
  assert.equal((await POST(request({image:new File(['x'],'x.txt',{type:'text/plain'})}))).status,400);
  console.log('PASS: language negotiation, media URLs, optional review image, pending moderation, invalid rating/text/identity/file');
})().catch(error=>{console.error(error);process.exitCode=1});
