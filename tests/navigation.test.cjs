const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const scripts = ['data.js','catalog-2026.js','catalog-schema.js','gestures.js','experience.js','reader.js','app.js'];
const sources = scripts.map(f=>fs.readFileSync(path.join(root,'public',f),'utf8'));
function app(hash='') {
 const dom = new JSDOM('<div id="app"></div><dialog id="dialog"></dialog><div id="notice"></div><div id="reader-announcement"></div><div id="info-tooltip" hidden></div>', {url:'https://techref.vercel.app/'+hash,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};
 for(const code of sources)w.eval(code);
 const navigate=hash=>{w.history.replaceState(null,'',hash);w.dispatchEvent(new w.HashChangeEvent('hashchange'));};
 const press=key=>w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true}));
 const tick=()=>new Promise(r=>setTimeout(r,10));
 return {dom,w,doc:w.document,navigate,press,tick};
}
function close(a){a.dom.window.close()}

test('120 references, six sets of 20, no missing legacy products or duplicate IDs',()=>{
 const a=app(),d=a.w.TECHREF,ref=d.products.filter(p=>p.selection);
 assert.equal(ref.length,120);assert.equal(new Set(d.products.map(p=>p.id)).size,d.products.length);
 for(const cat of ['gpu','cpu','ssd','ram'])assert.equal(ref.filter(p=>p.cat===cat).length,20);
 for(const platform of ['Android','iOS'])assert.equal(ref.filter(p=>p.cat==='smartphone'&&p.stats.platform===platform).length,20);
 assert.equal(d.products.length,619);assert.equal(d.categories.length,9);
 assert.equal(a.doc.querySelector('a[href*="/focus/"]'),null);
 close(a);
});

test('all reference product sections render with assets and meaningful data',()=>{
 const a=app();let views=0;
 for(const p of a.w.TECHREF.products.filter(p=>p.selection)){
  const c=a.w.TECHREF.categories.find(c=>c.id===p.cat),ts=a.w.TechRefExperience.topics(c,p);
  for(const t of ts){
   a.navigate('#/prodotto/'+p.id+'/'+t.key);
   assert.equal(a.doc.querySelector('.xr-title h1').textContent,p.short||p.name);
   assert.ok(a.doc.querySelector('.xr-metric strong').textContent!=='—',p.id+' '+t.key);
   assert.equal(a.doc.querySelector('.topic-tab[aria-current]').dataset.readerTab,t.key);
   const src=a.doc.querySelector('.stage-object').getAttribute('src');assert.ok(fs.existsSync(path.join(root,'public',src)),src);
   assert.ok(!a.doc.querySelector('[data-action="select"]'),'comparison absent from product');views++;
  }
 }
 assert.ok(views>450);close(a);
});

test('all legacy links still open; unknown topics fall back without blank sections',()=>{
 const a=app();
 for(const p of a.w.TECHREF.products){a.navigate('#/prodotto/'+p.id+'/overview');assert.ok(a.doc.querySelector('.unified-reader'),p.id)}
 a.navigate('#/prodotto/redmagic-11-pro/nonexistent');assert.equal(a.doc.querySelector('.topic-tab[aria-current]').dataset.readerTab,'overview');
 a.navigate('#/prodotto/nonexistent/overview');assert.match(a.doc.body.textContent,/Prodotto non trovato/);close(a);
});

test('keyboard preserves section between products and clamps every boundary',async()=>{
 const a=app('#/categoria/smartphone');
 assert.equal(a.doc.querySelectorAll('.product-row').length,20);
 a.navigate(a.doc.querySelector('[data-row-open]').getAttribute('href'));a.press('ArrowRight');await a.tick();
 assert.equal(a.doc.querySelector('.topic-tab[aria-current]').dataset.readerTab,'performance');
 a.press('ArrowDown');await a.tick();assert.match(a.doc.querySelector('h1').textContent,/iQOO 15/);
 assert.equal(a.doc.querySelector('.topic-tab[aria-current]').dataset.readerTab,'performance');
 a.press('ArrowUp');await a.tick();const atFirst=a.w.location.hash;a.press('ArrowUp');await a.tick();assert.equal(a.w.location.hash,atFirst);
 a.press('Escape');await a.tick();assert.match(a.w.location.hash,/categoria\/smartphone/);
 assert.equal(a.doc.activeElement.dataset.rowOpen,'redmagic-11-pro');close(a);
});

test('Android and iPhone lists are independent; selection order is not replaced with TFLOPS',async()=>{
 const a=app('#/categoria/smartphone');a.doc.querySelector('[data-action="platform"][data-value="iOS"]').click();
 const names=Array.from(a.doc.querySelectorAll('.row-name h2'),e=>e.textContent);
 assert.equal(names.length,20);assert.ok(names.every(n=>n.startsWith('iPhone')));assert.equal(names[0],'iPhone 18 Pro Max');
 assert.ok(names.indexOf('iPhone 16')<names.indexOf('iPhone 16 Pro'));
 a.navigate('#/categoria/gpu?set=selection&order=selectionPosition');
 const gpu=Array.from(a.doc.querySelectorAll('.row-name h2'),e=>e.textContent);
 assert.match(gpu[2],/5080/);assert.match(gpu[6],/7900 XTX/);assert.match(gpu[16],/Laptop/);
 a.navigate('#/categoria/ssd');assert.match(a.doc.querySelector('.catalog-caption').textContent,/Selezione UserBenchmark/);close(a);
});

test('query, platform and archive scope survive product links, reload and back',async()=>{
 const a=app('#/categoria/smartphone?set=selection&order=antutu&platform=iOS&q=17');
 assert.equal(a.doc.querySelector('#catalog-search').value,'17');
 const first=a.doc.querySelector('[data-row-open]');const productHash=first.getAttribute('href');a.navigate(productHash);
 const b=app(productHash);assert.match(b.doc.querySelector('.xr-title h1').textContent,/17/);
 b.press('Escape');await b.tick();assert.equal(b.doc.querySelector('#catalog-search').value,'17');
 assert.ok(b.doc.querySelector('[data-action="platform"][data-value="iOS"]').getAttribute('aria-pressed')==='true');
 a.navigate('#/prodotto/iphone-se-1st-generation/overview');assert.match(a.doc.querySelector('.rank-position').getAttribute('aria-label'),/di 54/);
 close(a);close(b);
});

test('reference semantics: GPU ranges, Apple GPU variants, RAM kit IDs and honest missing scores',()=>{
 const a=app(),r=a.w.TECHREF.products.filter(p=>p.selection);
 const laptop=r.find(p=>p.name.includes('Laptop'));assert.equal(laptop.stats.power,'80–150');assert.equal(laptop.stats.tflops,'≈28,3–39,7');
 assert.equal(r.find(p=>p.name==='iPhone 17e').stats.gpuCores,4);assert.equal(r.find(p=>p.name==='iPhone Air').stats.gpuCores,5);
 const cpu=r.filter(p=>p.cat==='cpu');assert.equal(cpu[0].stats.userBenchmark,undefined);assert.equal(cpu[10].stats.userBenchmark,126);
 for(const p of r.filter(p=>p.cat==='ram'))assert.ok(Math.abs(p.stats.cas-p.stats.cl*2000/p.stats.rate)<.01);
 for(const p of r.filter(p=>p.cat==='smartphone'))assert.equal(p.stats.antutu,p.stats.cpuScore+p.stats.gpuScore+p.stats.memoryScore+p.stats.uxScore);
 const phone=r.find(p=>p.cat==='smartphone');assert.equal(a.w.TechRefReader.asset(phone,'memory'),'assets/stage/ram.webp');
 a.navigate('#/prodotto/iphone-se-1st-generation/overview');assert.equal(a.doc.querySelector('.overview-score'),null);
 close(a);
});

test('gesture directions, accidental diagonals and tap thresholds',()=>{
 const a=app(),g=a.w.TechRefGestures;
 assert.equal(g.axisOf(80,80),null);assert.equal(g.axisOf(2,2),null);
 assert.equal(g.axisOf(-100,5),'property');assert.equal(g.axisOf(2,-100),'device');
 assert.equal(g.evaluate(-100,600).dir,1);assert.equal(g.evaluate(100,600).dir,-1);
 assert.equal(g.evaluate(-100,600).commit,true);assert.equal(g.evaluate(-8,600).commit,false);close(a);
});

test('real pointer swipe drives navigation; cancellation and middle click do not',async()=>{
 const a=app('#/prodotto/redmagic-11-pro/overview');
 const fire=(type,x,y,button=0)=>{const event=new a.w.Event(type,{bubbles:true,cancelable:true});Object.assign(event,{pointerType:'touch',pointerId:1,isPrimary:true,button,buttons:type==='pointerup'?0:1,clientX:x,clientY:y});a.doc.querySelector('.xr-stage').dispatchEvent(event);};
 // jsdom has no PointerEvent, the runtime mounts touch listeners in this environment.
 const touch=(type,x,y)=>{const e=new a.w.Event(type,{bubbles:true,cancelable:true}),t={identifier:1,clientX:x,clientY:y};Object.assign(e,{touches:type==='touchend'?[]:[t],changedTouches:[t]});a.doc.querySelector('.xr-stage').dispatchEvent(e);};
 touch('touchstart',250,100);touch('touchmove',100,102);touch('touchend',100,102);await a.tick();
 assert.equal(a.doc.querySelector('.topic-tab[aria-current]').dataset.readerTab,'performance');
 touch('touchstart',100,250);touch('touchmove',101,80);touch('touchend',101,80);await a.tick();
 assert.match(a.doc.querySelector('h1').textContent,/iQOO 15/);
 const current=a.w.location.hash;touch('touchstart',10,10);touch('touchmove',80,80);touch('touchend',80,80);await a.tick();assert.equal(a.w.location.hash,current);
 const link=a.doc.querySelector('.topic-tab'),e=new a.w.MouseEvent('click',{button:1,bubbles:true,cancelable:true});link.dispatchEvent(e);assert.equal(e.defaultPrevented,false);close(a);
});
