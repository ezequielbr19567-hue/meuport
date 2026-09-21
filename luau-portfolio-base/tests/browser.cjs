const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript');
const project=__dirname+'/..';
const m={exports:{}};new Function('exports',ts.transpileModule(fs.readFileSync(project+'/config/portfolio.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports);
const content=structuredClone(m.exports.defaultPortfolio);content.owner.username='@saved_owner';content.owner.heroTitleTop={en:'Saved world',pt:'Mundo salvo'};
const server=require('child_process').spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3000'],{cwd:project,stdio:'ignore'});process.on('exit',()=>server.kill());
(async()=>{
 for(let i=0;i<80;i++){try{await fetch('http://127.0.0.1:3000');break}catch{await new Promise(r=>setTimeout(r,250));}}
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'pt-BR'});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let mode='transient',calls=0;
 await page.route('**/api/content',async r=>{
   calls++;
   if(mode==='offline'||(mode==='transient'&&calls<3))return r.fulfill({status:503,json:{error:'temporary'}});
   if(mode==='slow')await new Promise(r=>setTimeout(r,6800));
   return r.fulfill({json:{source:'saved',content}});
 });
 await page.route('**/api/reviews',r=>r.fulfill({json:{configured:false,reviews:[]}}));await page.route('**/api/visit',r=>r.fulfill({json:{visits:123}}));
 await page.addInitScript(()=>{
   window.sawDefault=false;
   new MutationObserver(()=>{if(document.querySelector('.brand')?.textContent.includes('@your_username'))window.sawDefault=true}).observe(document,{childList:true,subtree:true});
 });
 await page.goto('http://127.0.0.1:3000');await page.getByRole('link',{name:'@saved_owner'}).waitFor();assert.equal(calls,3);assert.equal(await page.evaluate(()=>window.sawDefault),false);console.log('PASS automatic recovery after two 503s, no default flash');
 mode='offline';await page.reload();await page.getByRole('link',{name:'@saved_owner'}).waitFor();await page.getByText('Mostrando a última versão disponível.',{exact:false}).waitFor();console.log('PASS confirmed cached content survives offline reload');
 await page.evaluate(()=>localStorage.removeItem('portfolio-confirmed-content-v1'));await page.reload();await page.getByRole('heading',{name:'Não foi possível carregar o portfólio'}).waitFor();assert.equal(await page.locator('.brand').count(),0);
 mode='ok';await page.getByRole('button',{name:'Tentar novamente'}).click();await page.getByRole('link',{name:'@saved_owner'}).waitFor();console.log('PASS first visit error state and manual retry');
 await page.evaluate(()=>localStorage.removeItem('portfolio-confirmed-content-v1'));mode='slow';await page.reload();await page.getByRole('link',{name:'@saved_owner'}).waitFor({timeout:16000});assert.equal(await page.evaluate(()=>window.sawDefault),false);console.log('PASS response slower than old six-second timeout');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}console.log('PASS layout 320/390/768/1440');
 let adminFails=true,statsWrites=0;
 await page.route('**/api/admin/session',r=>r.fulfill({json:{authenticated:true}}));
 await page.route('**/api/admin/content',r=>r.request().method()==='POST'?r.fulfill({json:{ok:true}}):r.fulfill(adminFails?{status:503,json:{error:'offline'}}:{json:{content}}));
 await page.route('**/api/admin/stats',r=>{if(r.request().method()==='POST')statsWrites++;return r.fulfill({json:{visits:123,configured:true}})});
 await page.route('**/api/admin/reviews',r=>r.fulfill({json:{reviews:[],approvedCount:0}}));
 await page.goto('http://127.0.0.1:3000/dev');await page.getByRole('heading',{name:'Configurações indisponíveis'}).waitFor();assert.equal(await page.getByRole('button',{name:'Salvar tudo'}).count(),0);
 adminFails=false;await page.getByRole('button',{name:'Tentar novamente'}).click();await page.getByRole('button',{name:'Salvar tudo'}).waitFor();await page.getByRole('button',{name:'Salvar tudo'}).click();await page.getByText('Configurações salvas. As próximas aberturas',{exact:false}).waitFor();assert.equal(statsWrites,0);console.log('PASS admin blocks fallback edits, recovers, and preserves live visit counter');
 assert.deepEqual(errors,[]);await browser.close();server.kill();
})().catch(e=>{console.error(e);process.exit(1)});
