(() => {
'use strict';
const {products,icons}=window.FOCUS;
const chapters=['Panoramica','Memoria','Calcolo','Energia','Prezzo'];
const $=s=>document.querySelector(s),fmt=(n,d=0)=>n.toLocaleString('it-IT',{maximumFractionDigits:d}),esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>icons[n],link=(p,c)=>`#/gpu/${products[p].id}/${chapters[c].toLowerCase()}`;
let state={p:0,c:0,view:'product'},cleanup,transition='',suppressUntil=0,wheelUntil=0,query='',dialogTrigger,catalogScroll=0,catalogFocus='',lastView='';
const info={
 memory:p=>['Memoria video',`${p.memory} GB`,'Spazio per texture, scene 3D e dati in uso. Una capacità maggiore permette di gestire contenuti più pesanti.','I blocchi mostrano capacità, non il numero di chip fisici. La memoria da sola non determina gli FPS.'],
 memoryType:p=>['Tipo di memoria',p.memoryType,'È la tecnologia della memoria video. Capacità e velocità di trasferimento descrivono aspetti diversi.','I GB indicano quanto spazio è disponibile.'],
 bus:p=>['Bus di memoria',p.bus,'È la larghezza del collegamento tra processore grafico e memoria.','Per conoscere quanti dati passano in un secondo serve anche la velocità della memoria.'],
 architecture:p=>['Architettura',p.architecture,'La famiglia di progetto del processore grafico: come sono organizzate le sue unità e le sue funzioni.','Identifica una generazione tecnica, non un punteggio.'],
 cores:p=>['Core CUDA',fmt(parseInt(p.cores)),'Unità che eseguono calcoli in parallelo per elaborare immagini e dati.','Anche architettura, frequenza e software determinano le prestazioni.'],
 tflops:p=>['Calcolo teorico',`${fmt(p.tflops,2)} TFLOPS`,'Un teraflop equivale a mille miliardi di operazioni al secondo. Qui si misura il calcolo FP32 al clock boost.','Capacità teorica, non FPS in gioco.', 'Core CUDA × boost in GHz × 2 ÷ 1.000'],
 clock:p=>['Frequenza boost',p.clock.replace(' GHz boost',' GHz').replace('.',','),'Frequenza boost dichiarata per il processore grafico.','Il valore effettivo cambia con carico, temperatura e alimentazione.'],
 power:p=>['Potenza grafica',`${p.power} W`,'Potenza grafica totale dichiarata per la scheda. Aiuta a ragionare su alimentazione e calore da dissipare.','Non è un consumo costante e non include l’intero computer.'],
 price:p=>['Listino al lancio',`$${fmt(p.price.amount)}`,'Prezzo base annunciato dal produttore negli Stati Uniti al lancio, in dollari e senza imposte.','Dato storico: non è il prezzo di acquisto attuale né il listino italiano.'],
 ratio:p=>['Calcolo per 100 dollari',`${fmt(p.tflops/p.price.amount*100,2)} TFLOPS`,'Rapporto tra calcolo teorico FP32 e listino USA al lancio.','Non misura FPS per dollaro né convenienza attuale. Dollari nominali, senza correzione per inflazione.',`${fmt(p.tflops,2)} ÷ ${fmt(p.price.amount)} × 100`]
};
function metric(p,key,value,label){return `<button class="metric" data-info="${key}" aria-label="${esc(label+': '+value+'. Spiegazione')}"><span class="metric-value">${esc(value)}${icon('question')}</span><span class="metric-label">${esc(label)}</span><span class="tooltip" role="tooltip">${esc(info[key](p)[2])}</span></button>`;}
function diagram(p,c){
 if(c===1){const n=p.memory/2;return `<figure aria-label="${p.memory} GB, ${n} blocchi da 2 GB"><svg viewBox="0 0 640 250" role="img" aria-label="Ogni blocco rappresenta 2 GB">${Array.from({length:n},(_,i)=>`<rect x="${i%8*80+3}" y="${Math.floor(i/8)*110+12}" width="64" height="86" rx="2" fill="currentColor"/>`).join('')}</svg><figcaption><span>Ogni blocco è <strong>2 GB</strong></span><span>${n} blocchi</span></figcaption></figure>`;}
 if(c===2){const n=parseInt(p.cores)/256;return `<figure aria-label="${fmt(parseInt(p.cores))} unità CUDA"><svg viewBox="0 0 640 250" role="img" aria-label="${n} punti, ognuno rappresenta 256 core CUDA">${Array.from({length:n},(_,i)=>`<circle cx="${i%17*36+22}" cy="${Math.floor(i/17)*44+26}" r="8" fill="currentColor"/>`).join('')}</svg><figcaption><span>Ogni punto è <strong>256 core CUDA</strong></span><span>Schema numerico</span></figcaption></figure>`;}
 if(c===3)return `<figure aria-label="Potenza grafica totale: ${p.power} watt"><svg viewBox="0 0 640 240" role="img" aria-label="Scala da 0 a 600 watt">${Array.from({length:61},(_,i)=>`<line x1="${16+i*10}" x2="${16+i*10}" y1="${i%10===0?56:76}" y2="140" stroke="${i*10<=p.power?'#ddd':'#262626'}" stroke-width="2"/>`).join('')}${[0,200,400,600].map(v=>`<text x="${16+v}" y="175" fill="#999" font-size="13" text-anchor="${v===0?'start':v===600?'end':'middle'}">${v} W</text>`).join('')}<circle cx="${16+p.power}" cy="40" r="4" fill="#fff"/></svg><figcaption><span>Potenza grafica dichiarata</span><span>TGP</span></figcaption></figure>`;
 return '';
}
function scene(p,c){
 const m=(k,v,l)=>metric(p,k,v,l);
 const descriptions=['','Spazio per texture, scene 3D e dati in uso.','Unità che lavorano in parallelo per elaborare immagini e dati.','Quanta potenza elettrica può richiedere la scheda.','Il prezzo da cui è partita.'];
 let visual=c===0?`<div class="hero"><img src="${p.image}" alt="${p.name} Founders Edition, immagine ufficiale NVIDIA" draggable="false"></div>`:c===4?`<div class="price-visual"><img src="${p.image}" alt="${p.short}, NVIDIA" draggable="false"><div><span class="eyebrow">Listino USA al lancio · ${p.year}</span><strong class="feature"><small>$</small>${fmt(p.price.amount)}</strong><span class="visual-label">Dollari USA · imposte escluse</span></div></div>`:`<div class="section-visual"><div class="visual-heading"><strong class="feature">${c===1?p.memory:c===2?fmt(parseInt(p.cores)):p.power}${c!==2?`<small>${c===1?'GB':'W'}</small>`:''}</strong><span class="visual-label">${c===1?'Memoria video':c===2?'Core CUDA':'Potenza grafica totale'}</span></div>${diagram(p,c)}</div>`;
 const facts=[m('memory',p.memory+' GB','Memoria video')+m('architecture',p.architecture,'Architettura')+m('power',p.power+' W','Potenza grafica')+m('price','$'+fmt(p.price.amount),'Listino al lancio · USA'),m('memoryType',p.memoryType,'Tipo di memoria')+m('bus',p.bus.replace('-',' '),'Bus di memoria')+`<button class="explain" data-info="memory">Cosa cambia nell’uso ${icon('arrow-up-right')}</button>`,m('tflops',fmt(p.tflops,2),'TFLOPS FP32 teorici')+m('clock',p.clock.replace(' GHz boost',' GHz').replace('.',','),'Frequenza boost')+'<p class="note">La capacità teorica non misura gli FPS in gioco.</p>',m('power',p.power+' W','Potenza grafica dichiarata')+`<div><span class="metric-value">${fmt(p.power/1000,3)} kWh</span><span class="metric-label">1 ora a questo assorbimento</span></div><p class="note">Il consumo reale varia con il lavoro svolto.</p>`,m('ratio',fmt(p.tflops/p.price.amount*100,2),'TFLOPS per 100 $ al lancio')+`<div><span class="metric-value">${p.year}</span><span class="metric-label">Anno di lancio</span></div><p class="note">Listino storico, non prezzo attuale.</p>`][c];
 return `<article class="scene chapter-${c}" aria-label="${p.name}, ${chapters[c]}"><div class="heading"><p class="eyebrow">${c===0?'NVIDIA · '+p.year:p.name}</p><h1 tabindex="-1">${c===0?'<span>GeForce</span> '+p.short:chapters[c]}</h1>${c===0?`<p class="subtitle">${p.memory} GB ${p.memoryType} · ${p.architecture}</p>`:`<p class="description">${descriptions[c]}</p>`}</div>${visual}<div class="facts">${facts}</div></article>`;
}
function canMove(axis,d){return axis==='property'?state.c+d>=0&&state.c+d<chapters.length:state.p+d>=0&&state.p+d<products.length;}
function move(axis,d){if(!canMove(axis,d))return;transition=(axis==='property'?'x':'y')+(d>0?'-next':'-prev');location.hash=link(state.p+(axis==='device'?d:0),state.c+(axis==='property'?d:0));}
function arrow(axis,d){const target=axis==='property'?chapters[state.c+d]:products[state.p+d],name=axis==='property'?(d<0?'caret-left':'caret-right'):(d<0?'caret-up':'caret-down'),label=(axis==='property'?'Argomento':'Prodotto')+(d<0?' precedente':' successivo');return target?`<a class="arrow" href="${link(state.p+(axis==='device'?d:0),state.c+(axis==='property'?d:0))}" data-axis="${axis}" data-dir="${d}" aria-label="${label}: ${axis==='property'?target:target.short}. ${axis==='device'?'Mantieni '+chapters[state.c]:''}" title="${axis==='property'?target:target.short}">${icon(name)}</a>`:`<button class="arrow" disabled aria-label="${axis==='property'?'Argomento':'Prodotto'} ${d<0?'iniziale':'finale'}">${icon(name)}</button>`;}
function footer(){
 const p=products[state.p],c=state.c;
 return `<footer class="navigation"><nav class="chapters" aria-label="Argomenti"><button class="chapter-current" data-info="chapters" aria-haspopup="dialog" aria-label="${chapters[c]}. Scegli argomento">${chapters[c]}${icon('caret-down')}</button><div class="chapter-rail"><div class="chapter-arrows">${arrow('property',-1)}</div><div class="chapter-tabs">${chapters.map((name,i)=>`<a href="${link(state.p,i)}" title="${name}" aria-label="${name}" ${i===c?'aria-current="page"':''}><span class="sr">${name}</span><i aria-hidden="true"></i></a>`).join('')}</div><div class="chapter-arrows">${arrow('property',1)}</div></div></nav><nav class="product-nav" aria-label="Prodotti per TFLOPS FP32 decrescenti">${arrow('device',-1)}<div class="position"><button class="score" data-info="tflops" aria-label="${fmt(p.tflops,2)} TFLOPS FP32. Spiegazione"><strong>${fmt(p.tflops,2)}</strong><small>TFLOPS</small></button><span class="sr">Prodotto ${state.p+1} di ${products.length}</span></div>${arrow('device',1)}</nav></footer>`;
}
function catalog(){return `<main class="catalog" id="catalog"><div class="catalog-heading"><div><span class="eyebrow">Schede video · in evidenza</span><h1>GPU<small>03</small></h1></div><p>Calcolo teorico<small>TFLOPS FP32 · decrescente</small></p></div><label class="search"><span class="sr">Cerca un modello</span><input type="search" placeholder="Cerca un modello" value="${esc(query)}"><button class="clear-search" data-clear-search aria-label="Cancella ricerca" ${query?'':'hidden'}>${icon('x')}</button></label><div class="rows">${catalogRows()}</div></main>`;}
function catalogRows(){return products.map((p,i)=>({p,i})).filter(({p})=>p.name.toLowerCase().includes(query.toLowerCase())).map(({p,i})=>`<a class="row" href="${link(i,0)}" data-product="${p.id}"><span class="rank">0${i+1}</span><div><span class="eyebrow">NVIDIA · ${p.year}</span><h2>${p.short}</h2><small>${p.memory} GB ${p.memoryType}</small></div><img src="${p.image}" alt="${p.short}, NVIDIA" draggable="false"><span class="row-score">${fmt(p.tflops,2)}<small>TFLOPS</small></span>${icon('caret-right')}</a>`).join('')||'<div class="empty"><p>Nessun modello trovato.</p><button data-clear-search>Mostra tutti i modelli</button></div>';}
function updateOverflow(){const surface=$('#surface');if(surface)surface.toggleAttribute('data-scrollable',surface.scrollHeight>surface.clientHeight+3);}
function render(){
 const focused=document.activeElement;
 const focusKind=focused?.closest?.('.chapter-current')?'chapterMenu':focused?.closest?.('.chapter-tabs')?'chapter':focused?.closest?.('.product-nav')?'product':focused?.closest?.('.chapter-arrows')?'chapterArrow':'';
 const focusDir=focused?.dataset?.dir;
 const leaving=$('#catalog');if(leaving)catalogScroll=leaving.scrollTop;
 cleanup?.();
 const [view,id,chapter]=location.hash.replace(/^#\//,'').split('/');
 const pi=products.findIndex(p=>p.id===id),ci=chapters.findIndex(c=>c.toLowerCase()===chapter);
 state={view:view==='catalogo'||!view?'catalog':view==='gpu'&&pi>=0?'product':'missing',p:Math.max(0,pi),c:Math.max(0,ci)};
 if(state.view==='product'&&ci<0)history.replaceState(null,'',link(state.p,0));
 const p=products[state.p],isProduct=state.view==='product';
 document.title=isProduct?`${p.short} · ${chapters[state.c]} — TechRef`:'GPU — TechRef';
 if($('#detail').open)close();
 $('#app').innerHTML=`<div class="shell ${isProduct?'is-product':''}"><header class="header"><a class="wordmark" href="../#/atlante" aria-label="TechRef, categorie">techref</a>${isProduct?`<a class="back" href="#/catalogo">${icon('caret-left')}GPU</a>`:`<a class="back" href="../#/atlante">${icon('caret-left')}Categorie</a>`}<div class="header-right">${isProduct?`<button class="sources-button" data-info="sources" aria-label="Fonti" title="Fonti">${icon('arrow-up-right')}</button>`:`<a class="archive-link" href="../#/categoria/gpu">Tutte le GPU ${icon('arrow-up-right')}</a>`}</div></header>${state.view==='catalog'?catalog():isProduct?`<div class="viewer" id="viewer"><main class="surface" id="surface"><div class="motion ${transition}" id="motion">${scene(p,state.c)}</div></main><div class="gesture-hint" aria-hidden="true"></div>${footer()}</div>`:`<main class="missing"><h1>Scheda non trovata</h1><a href="#/catalogo">Torna alle GPU ${icon('caret-right')}</a></main>`}</div>`;
 transition='';$('#announce').textContent=isProduct?`${p.name}. ${chapters[state.c]}. Prodotto ${state.p+1} di ${products.length}.`:state.view==='catalog'?'Catalogo GPU':'Scheda non trovata';
 if(isProduct){
  catalogFocus=p.id;
  updateOverflow();
  const removeGesture=window.TechRefGestures.mount({surface:$('#viewer'),frame:$('#motion'),canMove,navigate:move,
   canStartAxis:(axis,e)=>!(axis==='device'&&e.target.closest('#surface[data-scrollable]')),
   onStart:()=>suppressUntil=0,onDrag:()=>suppressUntil=performance.now()+350,
   onUpdate:(axis,d,allowed)=>{const name=axis==='property'?chapters[state.c+d]:products[state.p+d]?.short;$('.gesture-hint').innerHTML=allowed?`${icon(axis==='property'?(d>0?'caret-right':'caret-left'):(d>0?'caret-down':'caret-up'))}<span>${name}</span>`:'<span>Fine percorso</span>';}
  });
  const observer=window.ResizeObserver?new window.ResizeObserver(updateOverflow):null;
  if(observer)document.querySelectorAll('#surface,.scene,.heading,.facts,.hero,.section-visual').forEach(el=>observer.observe(el));
  cleanup=()=>{removeGesture();observer?.disconnect();};
  if(lastView==='catalog')$('.heading h1')?.focus({preventScroll:true});
  else if(focusKind==='chapterMenu')$('.chapter-current')?.focus({preventScroll:true});
  else if(focusKind==='chapter')$('.chapter-tabs [aria-current]')?.focus({preventScroll:true});
  else if(focusKind==='chapterArrow')($(`[data-axis="property"][data-dir="${focusDir}"]`)||$('.chapter-tabs [aria-current]'))?.focus({preventScroll:true});
  else if(focusKind==='product')($(`[data-axis="device"][data-dir="${focusDir}"]`)||$('.score'))?.focus({preventScroll:true});
 }else if(state.view==='catalog'){
  $('#catalog').scrollTop=catalogScroll;
  if(lastView==='product'&&catalogFocus)document.querySelector(`[data-product="${catalogFocus}"]`)?.focus({preventScroll:true});
 }
 lastView=state.view;
}
function close(){const d=$('#detail');d.close();dialogTrigger?.focus();}
function openInfo(key){
 dialogTrigger=document.activeElement;
 const p=products[state.p],d=$('#detail');
 if(key==='chapters'){
  d.innerHTML=`<div class="detail-inner"><div class="detail-top"><span class="eyebrow">${p.short}</span><button class="arrow" data-close aria-label="Chiudi argomenti">${icon('x')}</button></div><h2 id="detail-title">Argomenti</h2><nav class="chapter-menu" aria-label="Scegli argomento">${chapters.map((name,i)=>`<a href="${link(state.p,i)}" ${i===state.c?'aria-current="page"':''}>${name}<span aria-hidden="true">${i===state.c?'—':icon('caret-right')}</span></a>`).join('')}</nav></div>`;
  d.showModal();return;
 }
 const v=info[key]?.(p);d.innerHTML=`<div class="detail-inner"><div class="detail-top"><span class="eyebrow">${p.short}</span><button class="arrow" data-close aria-label="Chiudi approfondimento">${icon('x')}</button></div><h2 id="detail-title">${key==='sources'?'Fonti':v[0]}</h2>${key==='sources'?`<p>Specifiche reference e immagini ufficiali NVIDIA. Listini USA al lancio.</p><div class="source-list"><a href="${p.imageSource}" target="_blank" rel="noreferrer">Prodotto e immagini ${icon('arrow-up-right')}</a><a href="${p.source}" target="_blank" rel="noreferrer">Specifiche tecniche ${icon('arrow-up-right')}</a><a href="${p.price.source.url}" target="_blank" rel="noreferrer">Annuncio e listino ${icon('arrow-up-right')}</a></div><p class="fine">Catalogo raccolto il 10 ottobre 2026. I TFLOPS FP32 sono derivati da core e clock boost.</p>`:`<strong class="detail-value">${v[1]}</strong><p>${v[2]}</p>${v[4]?`<p class="formula">${v[4]}</p>`:''}<p class="fine">${v[3]}</p><a class="source-link" href="${key==='price'||key==='ratio'?p.price.source.url:p.imageSource}" target="_blank" rel="noreferrer">Fonte NVIDIA ${icon('arrow-up-right')}</a>`}</div>`;d.showModal();}
document.addEventListener('click',e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;if(performance.now()<suppressUntil&&e.target.closest('#viewer')){e.preventDefault();e.stopPropagation();return;}const el=e.target.closest('[data-info],[data-close],[data-clear-search],[data-axis],a[href^="#/"]');if(!el)return;
 if(el.hasAttribute('data-info'))openInfo(el.dataset.info);
 else if(el.hasAttribute('data-close'))close();
 else if(el.hasAttribute('data-clear-search')){query='';$('.search input').value='';$('.rows').innerHTML=catalogRows();$('.clear-search').hidden=true;$('.search input').focus();}
 else if(el.hasAttribute('data-axis')){e.preventDefault();move(el.dataset.axis,Number(el.dataset.dir));}
 else{if(el.closest('.chapter-menu'))close();if(el.dataset.product)catalogFocus=el.dataset.product;const dest=el.getAttribute('href');if(dest===location.hash){e.preventDefault();}else{const parts=dest.split('/');const ni=products.findIndex(p=>p.id===parts[2]),nc=chapters.findIndex(c=>c.toLowerCase()===parts[3]);transition=ni!==state.p?`y-${ni>state.p?'next':'prev'}`:`x-${nc>state.c?'next':'prev'}`;}}
});
document.addEventListener('input',e=>{if(e.target.matches('.search input')){query=e.target.value;$('.rows').innerHTML=catalogRows();$('.clear-search').hidden=!query;catalogScroll=0;}});
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail'))close();});$('#detail').addEventListener('cancel',e=>{e.preventDefault();close();});
document.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.view==='product'&&!$('#detail').open){location.hash='#/catalogo';return;}if($('#detail').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.metaKey||e.ctrlKey||e.altKey)return;if(state.view==='catalog'){if(e.key==='ArrowDown'||e.key==='ArrowUp'){const rows=[...document.querySelectorAll('.row')],index=rows.indexOf(document.activeElement),next=Math.max(0,Math.min(rows.length-1,index<0?0:index+(e.key==='ArrowDown'?1:-1)));e.preventDefault();rows[next]?.focus();}return;}if(state.view!=='product')return;const a={ArrowLeft:['property',-1],ArrowRight:['property',1],ArrowUp:['device',-1],ArrowDown:['device',1]}[e.key];if(a){e.preventDefault();move(...a);}});
let wheelSum=0,wheelAxis='',wheelLast=0;document.addEventListener('wheel',e=>{if(!e.target.closest('#viewer')||$('#detail').open||e.ctrlKey||e.target.closest('#surface[data-scrollable]'))return;e.preventDefault();const now=performance.now();if(now<wheelUntil)return;const h=e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY),axis=h?'property':'device',delta=(e.shiftKey?e.deltaY:h?e.deltaX:e.deltaY)*(e.deltaMode===1?16:1);if(axis!==wheelAxis||Math.sign(delta)!==Math.sign(wheelSum)||now-wheelLast>180)wheelSum=0;wheelSum+=delta;wheelAxis=axis;wheelLast=now;if(Math.abs(wheelSum)>60){move(axis,Math.sign(wheelSum));wheelUntil=now+600;wheelSum=0;}},{passive:false});
window.addEventListener('resize',updateOverflow);window.addEventListener('load',updateOverflow);window.addEventListener('hashchange',render);if(!location.hash)history.replaceState(null,'','#/catalogo');render();
})();
