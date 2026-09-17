require('fs').mkdirSync(__dirname+'/previews',{recursive:true});
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const server=require('child_process').spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3000'],{cwd:__dirname+'/..',stdio:'ignore'});
process.on('exit',()=>server.kill());
(async()=>{
for(let i=0;i<40;i++){try{await fetch('http://127.0.0.1:3000');break}catch{await new Promise(r=>setTimeout(r,250));}}
const browser=await chromium.launch({headless:true});
const errors=[];
for(const width of (process.env.MEDIA_ONLY ? [] : [320,375,390,768,1024,1440])){
 const ctx=await browser.newContext({viewport:{width,height:900},locale:'pt-BR'});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000'); await page.locator('h1').waitFor();
 assert.equal(await page.locator('html').getAttribute('lang'),'pt-BR');
 const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 if(dimensions.scroll>width){ console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).map(e=>({tag:e.tagName,cls:e.className,w:e.getBoundingClientRect().width,r:e.getBoundingClientRect().right})).slice(0,30))); await page.screenshot({path:`${__dirname}/previews/overflow.png`,fullPage:true}); }
 assert.ok(dimensions.scroll<=width,JSON.stringify({width,...dimensions}));
 if(width<=1100){ await page.getByRole('button',{name:/Menu/}).click();await page.locator('#main-nav a[href="#reviews"]').click();assert.equal(await page.locator('.menuToggle').getAttribute('aria-expanded'),'false'); }
 await page.getByRole('button',{name:'EN',exact:true}).click();assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.reload(); await page.locator('h1').waitFor(); assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.getByRole('button',{name:'PT',exact:true}).click(); await page.evaluate(()=>scrollTo(0,0));
 if(width===390 || width===1440) await page.screenshot({path:`${__dirname}/previews/preview-${width}.png`,fullPage:true});
 console.log(`PASS ${width}px: no overflow, PT detection, EN persistence, navigation`);
}
const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/content',async route=>{const response=await route.fetch();const data=await response.json();data.content.builderProjects[0].image='/brand.png';data.content.builderProjects[0].video='https://youtu.be/dQw4w9WgXcQ';data.content.builderProjects[0].role={pt:'Construção',en:'Building'};await route.fulfill({json:data});});
await page.route('**/api/reviews',async route=>{if(route.request().method()==='POST') return route.fulfill({json:{ok:true,pending:true}});await route.fulfill({json:{configured:true,reviews:[],average:null,count:0}});});
await page.goto('http://127.0.0.1:3000');await page.locator('h1').waitFor();
await page.getByRole('button',{name:'EN',exact:true}).click(); console.log('Media fixture loaded', await page.locator('.imageTrigger').count());
assert.equal(await page.locator('iframe').count(),0);
await page.getByRole('button',{name:/Enlarge:/}).first().click();await page.locator('dialog[open]').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
await page.getByRole('button',{name:/Load video:/}).first().click();assert.equal(await page.locator('iframe').count(),1);
await page.locator('.caseStudy summary').first().click();assert.ok(await page.locator('.caseStudy dd').first().isVisible());
await page.getByLabel('Username / name').fill('Test client');await page.getByPlaceholder('Project or commission title').fill('Test project');await page.getByPlaceholder('What was your experience and what did I work on?').fill('Clear communication and good delivery.');await page.getByRole('button',{name:'4/5',exact:true}).click();await page.getByRole('button',{name:'Send for approval'}).click();await page.getByText('Thanks! Your review was sent and is waiting for approval.').waitFor();
console.log('PASS media dialog, Escape, deferred iframe, project details, review without image (mock API)');

const failure=await browser.newContext({locale:'pt-BR'});const fp=await failure.newPage();
await fp.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage')}})});
await fp.route('**/api/reviews',r=>r.abort());await fp.route('**/api/visit',r=>r.abort());await fp.goto('http://127.0.0.1:3000');await fp.locator('h1').waitFor();assert.equal(await fp.locator('html').getAttribute('lang'),'pt-BR');console.log('PASS API failure and blocked localStorage do not block page');
assert.deepEqual(errors,[]);await browser.close();server.kill();
})().catch(e=>{console.error(e);process.exit(1)});
