/* TechRef 07 — explain one product at a time. */
(() => {
  'use strict';
  const D=window.TECHREF;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const groups={
    gpu:[['overview','Prodotto',['tflops','memory','launchPrice']],['performance','Prestazioni',['tflops','architecture','cores','clock']],['memory','Memoria',['memory','memoryType','bus']],['energy','Energia',['power']],['value','Valore',['launchPrice','valuePer100','year']]],
    smartphone:[['overview','Prodotto',['antutu','chip','year']],['performance','Prestazioni',['antutu','chip','cpuScore','gpuScore','memoryScore','uxScore']],['screen','Display e foto',['size','hz','camera']],['memory','Memoria e autonomia',['ram','storage','battery']],['identity','Identità',['platform','year','chip']]],
    chip:[['overview','Chip',['nanoScore','cpuCores','graphics']],['performance','Benchmark',['nanoScore','nanoRank','antutu','geekSingle','geekMulti','nanoCpu','nanoGaming','nanoEfficiency']],['cpu','CPU',['cpuCores','clusters','frequency','process','instructionSet','cpuCache']],['graphics','GPU',['graphics','gpuCores','gpuArchitecture','gpuFrequency','gpuPipelines','gpuAlus','gpuApis']],['platform','Piattaforma',['ramType','ramMax','ramBandwidth','storageType','isp','video','modem','wifi','bluetooth','npu','year']]],
    schermi:[['overview','Display',['panel','resolution','hz']],['screen','Immagine',['panel','resolution','size']],['motion','Movimento',['hz','ms']]],
    sensori:[['overview','Sensore',['mp','format','pixel']],['detail','Dettaglio',['mp']],['light','Luce',['format','pixel']],['technology','Tecnologia',['technology']]],
    console:[['overview','Console',['family','year','tflops']],['performance','Hardware',['cpu','gpu','tflops','memory']],['experience','Esperienza',['resolution','storage']],['wiki','Mini wiki',['family','year']]]
  };
  const extras={launchPrice:['Listino al lancio','USD'],valuePer100:['FP32 per 100 $','TFLOPS'],nanoScore:['NanoReview','/100'],nanoCpu:['CPU · NanoReview','/100'],nanoGaming:['Gaming · NanoReview','/100'],nanoEfficiency:['Efficienza · NanoReview','/100'],geekSingle:['Geekbench 6 · singolo core','punti'],geekMulti:['Geekbench 6 · multi core','punti'],antutu:['AnTuTu 11','punti'],pixels:['Pixel totali','pixel'],nanoRank:['Posizione NanoReview',''],gpuFrequency:['Frequenza GPU','MHz'],gpuAlus:['Unità ALU GPU',''],gpuTflops:['Potenza GPU FP32','TFLOPS'],ramType:['Memoria supportata',''],ramMax:['RAM massima','GB'],modem:['Modem',''],wifi:['Wi-Fi',''],battery:['Autonomia dichiarata',''],memoryScore:['AnTuTu · memoria','punti'],uxScore:['AnTuTu · UX','punti']};
  const glossary={
    tflops:['Potenza di calcolo','Un TFLOPS equivale a mille miliardi di operazioni al secondo, con precisione FP32. È una capacità teorica, non il numero di fotogrammi nei giochi.'],
    memory:['Spazio di lavoro grafico.','La VRAM contiene texture, immagini e dati usati dalla GPU. Più capacità permette di tenere più dati pronti; da sola non rende la scheda più veloce.'],
    memoryType:['Come viaggiano i dati.','GDDR indica una famiglia di memoria grafica. Il trasferimento dei dati dipende anche dalla frequenza e dall’ampiezza del collegamento alla GPU.'],
    bus:['Le corsie della memoria.','I bit indicano l’ampiezza del collegamento tra GPU e memoria. Più corsie possono trasferire più dati a parità delle altre condizioni.'],
    cores:['Unità di calcolo parallele.','Sono le unità che eseguono i calcoli della GPU. Il produttore può chiamarle CUDA core, stream processor o Xe core, secondo il progetto del chip.'],
    architecture:['La generazione del progetto.','Descrive come è organizzato il chip. Cambiando architettura cambiano efficienza, funzioni e quantità di lavoro svolto per ciclo.'],
    clock:['Il ritmo del chip.','MHz e GHz indicano cicli al secondo. Il clock massimo può variare con temperatura, alimentazione e carico; non basta a misurare le prestazioni.'],
    power:['Il budget energetico.','Potenza della scheda dichiarata dal produttore. Non è il consumo misurato di ogni gioco e non include necessariamente il resto del computer.'],
    launchPrice:['Il listino originale.','Prezzo consigliato USA al lancio, in dollari nominali e al netto delle imposte. Non è il prezzo attuale, non è convertito in euro e non è corretto per l’inflazione.'],
    valuePer100:['Calcolo per 100 dollari','Si calcola così: TFLOPS FP32 ÷ listino USA × 100. Indica la capacità teorica per 100 dollari del prezzo di lancio, non gli FPS per dollaro.'],
    antutu:['Una prova dell’intero sistema.','AnTuTu assegna un punteggio ai test di CPU, GPU, memoria e sistema. La versione del test, il dispositivo e la temperatura incidono sul risultato. Android e iOS hanno scale separate.'],
    nanoRank:['La posizione nella fonte.','Posizione globale del SoC nel repertorio NanoReview consultato, non la sua posizione fra i soli chip presenti in TechRef.'],
    nanoScore:['Una sintesi della fonte.','Valutazione complessiva assegnata da NanoReview su una scala di 100 punti. È un indice della fonte, non una percentuale di velocità.'],
    nanoCpu:['La valutazione CPU.','Indice CPU riportato da NanoReview. Riassume i suoi test: uno scarto di punti non è uno scarto percentuale di prestazioni.'],
    nanoGaming:['La valutazione gaming.','Indice di gioco riportato da NanoReview, legato ai test della fonte. Non garantisce lo stesso frame rate su tutti i telefoni.'],
    nanoEfficiency:['La valutazione di efficienza.','Indice NanoReview, non ore di autonomia. Batteria, schermo e gestione termica del dispositivo influiscono sull’uso reale.'],
    geekSingle:['Una corsia di lavoro.','Geekbench 6 single core misura il lavoro svolto da un singolo core CPU durante il test.'],
    geekMulti:['Più corsie insieme.','Geekbench 6 multi core usa più core. Il risultato dipende anche da architettura, memoria e limiti termici; non è la somma del punteggio single core.'],
    cpu:['La parte generalista.','La CPU esegue logica e istruzioni delle applicazioni. Core diversi possono occuparsi di compiti rapidi o lavorare consumando meno.'],
    cpuCores:['Core della CPU','Un core è un’unità CPU capace di eseguire istruzioni. Il conteggio non dice quanto sia veloce ciascun core o quanta energia richieda.'],
    clusters:['Gruppi di core','Un cluster raggruppa core simili. Il diagramma mostra i conteggi dichiarati, non un’equivalenza di potenza fra tipi di core.'],
    frequency:['Il ritmo dei core.','La frequenza indica quanti cicli esegue il core ogni secondo. Ogni gruppo può avere un limite diverso; sotto carico la frequenza può variare.'],
    process:['La famiglia produttiva.','Il nodo in nanometri identifica la tecnologia usata per produrre il chip. Non è la dimensione fisica di ogni transistor.'],
    graphics:['La parte visiva.','La GPU gestisce grafica e calcolo parallelo. Nome, architettura, memoria e dispositivo contano più del solo numero di core.'],
    gpu:['La parte visiva.','Il processore grafico produce le immagini. Le specifiche teoriche aiutano a capire il progetto, senza sostituire i test nei giochi.'],
    gpuCores:['Unità grafiche dichiarate.','Unità grafiche indicate dal produttore per questo chip. Il significato di «core» dipende dall’architettura; un conteggio non pubblicato resta non dichiarato.'],
    gpuFrequency:['Il ritmo della GPU.','Frequenza della parte grafica riportata dalla fonte. Il dispositivo può ridurla sotto carico continuativo o quando si scalda.'],
    gpuAlus:['Unità aritmetiche.','Le ALU sono le unità che eseguono le operazioni matematiche all’interno della GPU.'],
    gpuTflops:['Calcolo grafico teorico.','Throughput FP32 riportato dalla fonte. Non equivale alle prestazioni misurate nei giochi sul telefono.'],
    chip:['Il motore del dispositivo.','Il SoC integra CPU, GPU e altri blocchi. La stessa piattaforma può comportarsi diversamente in telefoni con raffreddamento e memoria differenti.'],
    ram:['Lo spazio delle app aperte.','La RAM mantiene i dati in uso. Più capacità aiuta con carichi e applicazioni simultanee, senza garantire da sola una maggiore velocità.'],
    storage:['Lo spazio che resta.','L’archiviazione conserva sistema, giochi, foto e file. La capacità disponibile è inferiore al totale nominale e non indica la velocità del supporto.'],
    size:['Quanto spazio visivo.','La diagonale è misurata in pollici. Dimensioni percepite e nitidezza dipendono anche da proporzioni, risoluzione e distanza di visione.'],
    resolution:['Quanti punti compongono l’immagine.','La risoluzione indica quanti pixel compongono l’immagine: prima la larghezza, poi l’altezza. Non indica la dimensione fisica dello schermo.'],
    panel:['Come nasce la luce.','Il tipo di pannello influenza contrasto, neri, risposta e resa dell’immagine. Le prestazioni variano anche fra modelli della stessa tecnologia.'],
    hz:['Quante immagini al secondo.','Un display a 144 Hz può aggiornarsi fino a 144 volte al secondo. Per sfruttarlo, anche contenuto e dispositivo devono fornire fotogrammi sufficienti.'],
    ms:['Quanto impiega un pixel a cambiare.','Tempo di risposta dichiarato, spesso GtG. Non misura l’intero input lag e può dipendere da modalità e protocolli del produttore.'],
    camera:['La fotocamera come sistema.','Megapixel, sensore, ottica ed elaborazione lavorano insieme. Il numero di megapixel da solo non descrive la qualità di una foto.'],
    battery:['Un test, non ogni giornata.','L’autonomia dichiarata dipende dal protocollo del produttore. Ore di riproduzione video non sono ore garantite di uso misto.'],
    mp:['La quantità di campioni.','Un megapixel equivale a un milione di pixel. Più MP possono conservare più dettaglio, ma luce, ottica e trattamento dell’immagine restano determinanti.'],
    format:['La classe del sensore.','Il formato ottico usa una convenzione storica: non è la diagonale fisica in pollici. Senza dimensioni reali non ne ricaviamo un’area precisa.'],
    pixel:['La misura di un fotosito.','Il passo del pixel è la distanza fra i centri di due pixel vicini, misurata in micrometri. Un micrometro è un millesimo di millimetro.'],
    technology:['Il progetto del sensore.','Struttura e funzioni del sensore, come stacked o pixel binning, modificano il modo in cui l’informazione viene acquisita e letta.'],
    isp:['Il laboratorio delle immagini.','L’Image Signal Processor elabora i dati delle fotocamere. Le funzioni supportate dal chip non sono necessariamente tutte attivate sul dispositivo.'],
    ramType:['La memoria che il chip può usare.','Il supporto indica la tecnologia compatibile con il SoC. La dotazione effettiva dipende dal dispositivo in cui viene installato.'],
    ramMax:['Un limite della piattaforma.','La quantità massima supportata dal SoC non è la RAM presente in ogni telefono.'],
    modem:['Il collegamento alla rete mobile.','Indica la piattaforma radio supportata. Bande, velocità e funzioni effettive dipendono anche da telefono, operatore e copertura.'],
    wifi:['Il collegamento locale.','La versione supportata dal chip non garantisce che tutte le funzioni siano implementate nel dispositivo finale.'],
    year:['Il contesto storico.','Anno del primo lancio registrato. Una data con † richiede ancora una conferma primaria puntuale.'],
    family:['La linea evolutiva.','Raggruppa console e revisioni hardware della stessa famiglia. La mini wiki riassume storia e compatibilità.'],
    platform:['Il sistema di riferimento.','Il sistema operativo determina anche API e versione dei test. Per questo i punteggi AnTuTu Android e iOS restano separati.'],
    cpuScore:['La componente CPU.','Punteggio della parte CPU del test AnTuTu indicato. Usalo all’interno della stessa versione e piattaforma.'],
    gpuScore:['La componente grafica.','Punteggio della parte GPU del test AnTuTu indicato. Dipende anche dalle API grafiche e dal dispositivo.'],
    memoryScore:['La componente memoria.','Sottopunteggio AnTuTu per memoria e archiviazione. Non è un numero di gigabyte.'],
    uxScore:['La componente di utilizzo.','Sottopunteggio delle prove UX di AnTuTu. È un risultato del test, non una valutazione completa della user experience.']
  };
  const category=id=>D.categories.find(c=>c.id===id);
  const topics=c=>(groups[c.id]||[]).map(([key,label,keys])=>({key,label,keys}));
  const field=(p,key)=>{const f=category(p.cat).fields.find(x=>x.key===key),e=extras[key];return e?{key,label:e[0],unit:e[1]}:f||{key,label:key,unit:''};};
  function fmt(p,key,unit=true){const v=p.stats[key],f=field(p,key);if(v==null||v==='')return 'N/D';let s=typeof v==='number'?v.toLocaleString('it-IT',{maximumFractionDigits:2}):String(v);if(key==='year'){s=String(v)+(p.yearUnverified?'†':'');return s;}return s+(unit&&f.unit?' '+f.unit:'');}
  function normalize(c,key){const ts=topics(c);if(ts.some(t=>t.key===key))return key;return ts.find(t=>t.key!=='overview'&&t.keys.includes(key))?.key||'overview';}
  function info(p,key){const f=field(p,key),base=glossary[key]||[f.label,'Specifica riportata dalla fonte. Un dato isolato non descrive la qualità complessiva del prodotto.'];let note='';if(key==='launchPrice'&&p.pricing)note=p.pricing.note||'';if(p.cat==='chip'&&p.nanoReview&&['nanoScore','antutu','geekSingle','geekMulti','nanoCpu','nanoGaming','nanoEfficiency'].includes(key))note='NanoReview · rilevazione '+(p.nanoReview.asOf||D.date)+'.';if(key==='antutu'&&p.benchmarkScope)note=p.benchmarkScope;if(p.fieldSources?.[key])note=[note,p.fieldSources[key].label,p.fieldSources[key].note].filter(Boolean).join(' · ');return {title:base[0],text:base[1],note,label:f.label,value:fmt(p,key)};}
  function chip(p,key){const i=info(p,key);return `<button class="info-chip ${p.stats[key]==null?'is-missing':''}" type="button" data-action="info" data-id="${esc(p.id)}" data-key="${esc(key)}" aria-label="${esc(i.label+': '+i.value+'. Spiegazione')}" aria-haspopup="dialog"><span>${esc(i.value)}</span><small>${esc(i.label)}</small><i aria-hidden="true">?</i></button>`;}
  const chips=(p,keys)=>`<div class="info-chips">${keys.map(k=>chip(p,k)).join('')}</div>`;
  function primary(p,g){const k={gpu:{overview:'tflops',performance:'tflops',memory:'memory',energy:'power',value:'launchPrice'},smartphone:{overview:'antutu',performance:'antutu',screen:'hz',memory:'ram',identity:'year'},chip:{overview:'nanoScore',performance:'nanoScore',cpu:'cpuCores',graphics:'graphics',platform:'process'},schermi:{overview:'hz',screen:'resolution',motion:'hz'},sensori:{overview:'mp',detail:'mp',light:'pixel',technology:'technology'},console:{overview:'year',performance:'tflops',experience:'storage',wiki:'year'}};return k[p.cat]?.[g]||'year';}
  function summary(p,g){const texts={gpu:{performance:'Calcolo teorico. Reso visibile.',memory:'Più spazio per texture e dati.',energy:'Il budget energetico della scheda.',value:'Quanto FP32 ottieni con lo stesso budget.'},chip:{performance:'La posizione del chip nei test.',cpu:'Core diversi. Compiti diversi.',graphics:'Il motore delle immagini.',platform:'Tutto quello che il chip può collegare.'},schermi:{screen:'Lo spazio dell’immagine, pixel per pixel.',motion:'Il tempo fra un’immagine e la successiva.'},smartphone:{performance:'Il risultato del sistema completo.',screen:'Quello che vedi. Quello che catturi.',memory:'Spazio per lavorare, spazio per conservare.',identity:'Il prodotto nel suo contesto.'},sensori:{detail:'Quanti punti descrivono la scena.',light:'La scala di un singolo pixel.',technology:'Come viene acquisita l’immagine.'},console:{performance:'Il sistema che costruisce il gioco.',experience:'Schermo, supporti e archiviazione.',wiki:'Una famiglia, più generazioni.'}};return texts[p.cat]?.[g]||'';}
  function metric(p,key){const f=field(p,key),v=fmt(p,key,false);return `<div class="story-metric"><strong class="${v.length>15?'is-text':v.length>9?'is-long':''}">${esc(v)}</strong><span>${esc(f.unit||f.label)}</span></div>`;}
  function detail(p,g){const t=topics(category(p.cat)).find(t=>t.key===g)||topics(category(p.cat))[0];if(g==='overview')return `${chips(p,t.keys)}<p class="cover-caption">Visual di categoria</p>`;return `<div class="story-heading"><span class="eyebrow">${esc(t.label)}</span><h2>${esc(summary(p,g))}</h2></div>${metric(p,primary(p,g))}${chips(p,t.keys)}`;}
  function memory(p,key){
    const n=p.stats[key];if(typeof n!=='number'||n<=0)return '';
    const unit=n>64?8:n>32?4:2;
    return `<div class="memory-visual"><span class="visual-kicker">Un blocco = ${unit} GB</span><div class="memory-blocks" role="img" aria-label="${esc(fmt(p,key))}, ${Math.ceil(n/unit)} blocchi da ${unit} GB, ultimo proporzionale alla capacità residua">${Array.from({length:Math.ceil(n/unit)},(_,j)=>`<i style="--fill:${Math.min(1,n/unit-j)*100}%" aria-hidden="true"></i>`).join('')}</div><p class="visual-note">Spazio per i dati in uso.</p></div>`;
  }
  function cpu(p){const cs=p.cpuDetail||[];if(!cs.length)return empty('Topologia dei core non pubblicata.');return `<div class="core-visual"><span class="visual-kicker">Un blocco = un core CPU</span>${cs.map((c,i)=>`<div class="cluster-line"><div class="cluster-tiles cluster-${i}">${Array.from({length:Math.min(24,Number(c.count)||0)},()=>'<i></i>').join('')}</div><div><strong>${esc(c.count||'N/D')} × ${esc(c.type||c.name||'CPU')}</strong><span>${esc(c.clock||'Frequenza non dichiarata')}</span></div></div>`).join('')}<p class="visual-note">Numero e raggruppamento dei core dichiarati. Le dimensioni dei blocchi non misurano la loro potenza.</p>${p.nanoReview?.notes?.length?`<details class="source-disclosure"><summary>Note della fonte</summary><p>${esc(p.nanoReview.notes.join(' '))}</p></details>`:''}</div>`;}
  function resolution(p){
    const matches=String(p.stats.resolution||'').match(/(\d{3,5})\s*[×x]\s*(\d{3,5})/);if(!matches)return '';
    const w=+matches[1],h=+matches[2],scale=Math.min(420/w,220/h),width=w*scale,height=h*scale,x=(520-width)/2,y=35;
    return `<div class="resolution-visual"><svg viewBox="0 0 520 310" role="img" aria-label="${w} pixel in larghezza e ${h} pixel in altezza"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#ffffff08" stroke="#bbb"/><text x="260" y="${y+height+26}" fill="#ccc" font-size="13" text-anchor="middle">${w} pixel</text><text x="${x-14}" y="${y+height/2}" fill="#999" font-size="12" text-anchor="middle" transform="rotate(-90 ${x-14} ${y+height/2})">${h} pixel</text></svg><p class="visual-note">Larghezza × altezza. Forma in proporzione, non dimensioni fisiche.</p></div>`;
  }
  function refresh(p){
    const n=p.stats.hz;if(typeof n!=='number'||n<=0)return '';
    const frames=Math.max(1,Math.round(n/10));
    return `<div class="refresh-visual"><span class="visual-kicker">Aggiornamenti in 100 millisecondi</span><div class="refresh-row"><div><strong>${(1000/n).toLocaleString('it-IT',{maximumFractionDigits:2})} ms</strong><span>fra due aggiornamenti</span></div><div class="frame-ticks" style="--frames:${frames}" role="img" aria-label="Circa ${frames} aggiornamenti in 100 millisecondi">${Array.from({length:frames},()=>'<i aria-hidden="true"></i>').join('')}</div></div><p class="visual-note">Un tratto = un aggiornamento. Quantità arrotondata.</p></div>`;
  }
  function pixel(p){
    const n=parseFloat(String(p.stats.pixel||'').replace(',','.'));if(!Number.isFinite(n)||n<=0)return '';
    return `<div class="pixel-visual"><div class="pixel-single" role="img" aria-label="Passo del pixel: ${n} micrometri"><i aria-hidden="true"></i><span>↔ ${esc(p.stats.pixel)}</span></div><p class="visual-note">Distanza fra i centri di due pixel vicini. Schema ingrandito.</p></div>`;
  }
  function wiki(p){const w=p.wiki||{},family=D.products.filter(x=>x.cat==='console'&&x.family===p.family).sort((a,b)=>(a.stats.year||0)-(b.stats.year||0));return `<div class="wiki-visual"><p>${esc(w.intro||'')}</p><nav aria-label="Revisioni della famiglia">${family.map(x=>`<a href="#/prodotto/${esc(x.id)}/wiki" class="${x.id===p.id?'current':''}"><span>${esc(fmt(x,'year'))}</span><strong>${esc(x.name)}</strong></a>`).join('')}</nav>${w.compatibility?`<p class="visual-note">${esc(w.compatibility)}</p>`:''}</div>`;}
  function gpuUnits(p){const n=p.gpuDetail?.cores;if(typeof n!=='number'||n<1||n>64)return '';return `<div class="core-visual"><span class="visual-kicker">Un blocco = una unità ${esc(p.gpuDetail?.coreUnit||'GPU')}</span><div class="cluster-tiles" role="img" aria-label="${n} unità grafiche">${Array.from({length:n},()=>'<i aria-hidden="true"></i>').join('')}</div></div>`;}
  function visualForKey(p,key){
    if(['memory','ram'].includes(key))return memory(p,key);
    if(['cpu','cpuCores','clusters'].includes(key)&&p.cat==='chip')return cpu(p);
    if(['graphics','gpuCores'].includes(key)&&p.cat==='chip')return gpuUnits(p);
    if(key==='hz')return refresh(p);
    if(key==='resolution')return resolution(p);
    if(key==='pixel')return pixel(p);
    return '';
  }
  function empty(text){return `<div class="visual-empty"><span>—</span><p>${esc(text)}</p></div>`;}
  function visual(p,g){
    if(g==='wiki')return wiki(p);
    if(p.cat==='chip'&&g==='cpu')return cpu(p);
    if(p.cat==='chip'&&g==='graphics')return gpuUnits(p);
    if(p.cat==='schermi'&&g==='screen')return resolution(p);
    if((p.cat==='schermi'&&g==='motion')||(p.cat==='smartphone'&&g==='screen'))return refresh(p);
    if(p.cat==='sensori'&&g==='light')return pixel(p);
    if((p.cat==='gpu'||p.cat==='smartphone')&&g==='memory')return memory(p,primary(p,g));
    return '';
  }
  function brief(p,key){
    if(p.stats[key]==null||p.stats[key]==='')return 'Dato non disponibile nelle fonti verificate.';
    const text={tflops:'Capacità di calcolo teorica della GPU.',memory:'Spazio per texture e dati grafici.',power:'Potenza totale dichiarata della scheda.',launchPrice:'Prezzo consigliato negli USA al lancio.',valuePer100:'Calcolo teorico per 100 dollari di listino.',antutu:'Un test di CPU, grafica, memoria e sistema.',nanoScore:'Valutazione NanoReview, su una scala di 100 punti.',cpuCores:'Le unità che eseguono le istruzioni delle app.',graphics:'Il processore che gestisce la grafica.',process:'Tecnologia con cui viene prodotto il chip.',ram:'Spazio di lavoro delle app aperte.',hz:'Quante volte lo schermo può aggiornarsi in un secondo.',resolution:'Numero di pixel in larghezza e in altezza.',mp:'Milioni di pixel che compongono l’immagine.',pixel:'Distanza fra due pixel vicini del sensore.',storage:'Spazio per sistema, giochi e file.',year:'Anno del primo lancio.'};
    return text[key]||'';
  }
  function tooltip(p,key){const i=info(p,key);return `<span>${esc(i.label)}</span><strong>${esc(i.title)}</strong><p>${esc(i.text)}</p>${i.note?`<small>${esc(i.note)}</small>`:''}`;}
  window.TechRefExperience={topics,normalize,field,fmt,info,chip,chips,primary,detail,visual,visualForKey,tooltip,brief,groups};
})();
