const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const root=path.join(__dirname,'..');
function load(file,mocks={}) {
 const full=path.resolve(root,file),module={exports:{}};
 const js=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',js)(name=>{
  if(name in mocks)return mocks[name];
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts',mocks);
  if(name.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(full),name))+'.ts',mocks);
  return require(name);
 },module,module.exports);return module.exports;
}
(async()=>{
 const {defaultPortfolio}=load('config/portfolio.ts');
 const custom=structuredClone(defaultPortfolio);custom.owner.username='@saved_owner';custom.owner.intro='Texto personalizado legado';
 let result={data:{content:custom},error:null};
 const query={select(){return this},eq(){return this},abortSignal(){return this},async maybeSingle(){return result},async upsert(){return {error:null}}};
 const mocks={'@/lib/supabaseAdmin':{getAdminClient:()=>({from:()=>query})}};
 const store=load('lib/contentStore.ts',mocks);
 const good=await store.getPortfolioContent();assert.equal(good.owner.username,'@saved_owner');assert.equal(good.owner.intro.en,'Texto personalizado legado');
 result={data:null,error:{message:'network'}};
 const original=console.error;console.error=()=>{};
 await assert.rejects(()=>store.getPortfolioContent());await assert.rejects(()=>store.getPortfolioContent(true));console.error=original;
 result={data:null,error:null};await assert.rejects(()=>store.getPortfolioContent());assert.deepEqual(await store.getPortfolioContent(true),defaultPortfolio);
 const missing=load('lib/contentStore.ts',{'@/lib/supabaseAdmin':{getAdminClient:()=>null}});await assert.rejects(()=>missing.getPortfolioContent(true));
 assert.equal((await store.getPublicPortfolioContent()).source,'default');
 assert.deepEqual((await missing.getPublicPortfolioContent()).content,defaultPortfolio);
 result={data:{content:defaultPortfolio},error:null};assert.equal((await store.getPublicPortfolioContent()).source,'saved');
 result={data:null,error:{message:'offline'}};console.error=()=>{};await assert.rejects(()=>store.getPublicPortfolioContent());console.error=original;
 const route=load('app/api/content/route.ts',{'@/lib/contentStore':{getPublicPortfolioContent:async()=>{throw Error('offline')}}});
 const response=await route.GET();assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store, max-age=0');assert.equal((await response.json()).content,undefined);
 const okRoute=load('app/api/content/route.ts',{'@/lib/contentStore':{getPublicPortfolioContent:async()=>({content:good,source:'saved'})}});assert.equal((await (await okRoute.GET()).json()).source,'saved');
 const validation=load('lib/contentValidation.ts');assert.equal(validation.isPortfolioContent(good),true);assert.equal(validation.isPortfolioContent({...good,builderProjects:[null]}),false);
 let stored=null;global.localStorage={getItem:()=>stored,setItem:(k,v)=>{stored=v}};
 const client=load('lib/contentClient.ts');client.rememberContent(good);assert.equal(client.readConfirmedContent().owner.username,'@saved_owner');stored='{broken';assert.equal(client.readConfirmedContent(),null);
 stored=JSON.stringify({version:1,savedAt:Date.now()-8*86400000,content:good});assert.equal(client.readConfirmedContent(),null);
 global.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.equal(client.readConfirmedContent(),null);client.rememberContent(good);
 const realFetch=global.fetch;global.fetch=async()=>new Response(JSON.stringify({content:good}),{status:200});await assert.rejects(()=>client.requestContent(new AbortController().signal));
 for(const source of ['saved','default']) {
  global.fetch=async()=>new Response(JSON.stringify({content:defaultPortfolio,source}),{status:200});
  const response=await client.requestContent(new AbortController().signal);assert.equal(response.source,source);assert.deepEqual(response.content,defaultPortfolio);
 }
 global.fetch=async()=>new Response(JSON.stringify({content:{},source:'default'}),{status:200});await assert.rejects(()=>client.requestContent(new AbortController().signal));
 global.fetch=realFetch;
 console.log('PASS content regression: storage failures, missing row/config, legacy text, 503/no-store, saved source, validation, corrupt/expired/blocked cache, unconfirmed responses');
})().catch(e=>{console.error(e);process.exitCode=1});
