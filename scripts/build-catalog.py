"""Import the frozen Markdown, without network access. Keep legacy IDs and sources."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
text = (ROOT / 'docs/CATALOGO-120-2026-10-14.md').read_text()
tables = []
for chunk in text.split('\n\n'):
    if chunk.startswith('|'):
        tables.append([[c.strip() for c in line.strip('|').split('|')] for line in chunk.splitlines()[2:]])
raw = (ROOT / 'public/data.js').read_text()
legacy = json.loads(raw[raw.index('=') + 1:].strip().removesuffix(';'))
def number(s):
    return None if s in ('—', '', 'N/D') else float(s.replace('.', '').replace(',', '.').replace('≈', ''))
def link(s):
    m = re.search(r'\[([^\]]+)\]\((https://[^\s]+)\)', s)
    return m.groups() if m else (s, None)
def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
def normalized(s):
    return re.sub(r'[^a-z0-9]', '', s.lower().replace('nvidia ', '').replace('amd ', '').replace('samsung ', ''))
def existing(name, cat):
    if name.startswith('iPhone SE (3'):
        return next(p for p in legacy['products'] if p['id'] == 'iphone-se-3rd-generation')
    matches = [p for p in legacy['products'] if p['cat'] == cat and normalized(p['name']) == normalized(name)]
    assert len(matches) <= 1, (name, matches)
    return matches[0] if matches else {}
rows = []
def product(name, cat, rank, url, stats, variant=''):
    old = existing(name, cat)
    p = dict(id=old.get('id', cat + '-' + slug(name + ('-' + variant if cat == 'ram' else ''))),
             cat=cat, name=name, short=name.replace('NVIDIA ', '').replace('AMD ', '').replace('Intel ', ''),
             brand='Apple' if name.startswith('iPhone') else 'WD_BLACK' if name.startswith('WD_BLACK') else name.split()[0],
             variant=variant or old.get('variant', ''), stats=stats, selectionPosition=rank,
             source=url, snapshot='2026-10-14', selection='catalog-120',
             sources=[{'label':'Specifiche · raccolta 14/10/2026', 'url':url}] if url else [],
             provenance={'document':'docs/CATALOGO-120-2026-10-14.md','snapshot':'2026-10-14','legacyId':old.get('id'),
                         'originalName':name, 'benchmarkScore':None})
    p['stats']['selectionPosition'] = rank
    rows.append(p)
    return p
for r in tables[1]:
    rank,name,arch,mem,cores,fp,power = r
    name,url = link(name)
    gb,memtype = mem.split(' ',1)
    stats = dict(architecture=arch,memory=int(gb),memoryType=memtype,cores=cores,
                 tflops=fp if '–' in fp else number(fp),power=power.replace('¹','') if '–' in power else number(power))
    p=product(name,'gpu',int(rank),url,stats)
    p['provenance']['fp32Method']='calculated' if fp.startswith('≈') else 'manufacturer'
    p['fieldSources']={'tflops':{'label':'FP32 teorici','note':'Core × boost × 2 / 1000, clock arrotondato.' if fp.startswith('≈') else 'Dato dichiarato dal produttore.'}}
    p['note']='Posizione della selezione UserBenchmark; TFLOPS separati dal ranking. CUDA, SP e CU non sono unità intercambiabili.'
    if 'Laptop' in name:
        p['variant']='GPU per notebook · potenza configurabile'
        p['note']+=' Intervallo 80–150 W e FP32 28,3–39,7: serve la configurazione del notebook, non attribuire il massimo a ogni macchina.'
for r in tables[2]:
    rank,name,cores,threads,boost,power,socket=r
    name,url=link(name)
    count=sum(int(v) for v in re.findall(r'(\d+)[PE]',cores)) if 'P' in cores else int(cores.split()[0])
    p=product(name,'cpu',int(rank),url,dict(cpuCores=count,clusters=cores,threads=int(threads),boost=number(boost),powerSpec=None if power=='—' else power,socket=socket),cores)
    p['cpuDetail']=[{'count':int(n),'type':'Performance' if kind=='P' else 'Efficiency','clock':''} for n,kind in re.findall(r'(\d+)([PE])',cores)] or [{'count':count,'type':'Zen 5','clock':''}]
    p['note']='Ordine Speed Rank UserBenchmark, non qualità assoluta. Intel: potenza base / massima turbo; AMD: TDP. Non sono la stessa misura.'
    if int(rank)>10:
        ev=tables[3][int(rank)-11]
        p['stats']['userBenchmark']=int(ev[2].strip('%'))
        p['sources'].append({'label':'UserBenchmark · evidenza indicizzata', 'url':link(ev[3])[1]})
        p['provenance']['rankingEvidence']='indexed-source'
    else: p['provenance']['rankingEvidence']='user-screenshot'
for r in tables[4]:
    rank,name,interface,read,write,tbw,sku=r
    name,url=link(name)
    capacity=int(re.search(r'(\d+) (TB|GB)$',name)[1])*(1000 if name.endswith('TB') else 1)
    bus,form=interface.split(' / ')
    p=product(name,'ssd',int(rank),url,dict(capacity=capacity,read=number(read),write=number(write),tbw=number(tbw),interface=bus,form=form,sku=sku.strip('`')),interface)
    p['note']='Selezione UserBenchmark: questo ordine non misura la velocità. Lettura/scrittura sono massimi sequenziali del produttore. SKU rappresentativo, non identità certificata del campione benchmark; dissipatore e revisione da confermare.'
for r in tables[5]:
    rank,name,generation,rate,cl,kit,capacity,latency=r
    rate=int(number(rate)); cl=int(cl)
    p=product(name,'ram',int(rank),'https://ram.userbenchmark.com/',dict(generation=generation,rate=rate,cl=cl,kit=kit,capacity=int(capacity.split()[0]),cas=number(latency),sku=None),f'{generation} · {rate} MT/s · CL{cl} · {kit}')
    p['provenance']['identityStatus']='aggregated-group' if '/' in name else 'kit-without-sku'
    p['note']='Selezione UserBenchmark, non classifica di velocità. CAS teorica = CL × 2000 / MT/s; non è la latenza completa. SKU, tensione e profilo non acquisiti.'
    if '/' in name:p['note']+=' La fonte aggrega più famiglie: non assegnare una linea commerciale specifica.'
for table,subs,platform in [(6,7,'Android'),(8,9,'iOS')]:
    for i,r in enumerate(tables[table]):
        if platform=='Android':rank,name,chip,config,total=r; original=rank
        else:rank,original,name,chip,config,total=r
        name,url=link(name); ram,storage=map(int,config.split(' + '))
        stats=dict(antutu=int(number(total)),chip=chip,ram=ram,testStorage=storage,platform=platform)
        stats.update(dict(zip(['cpuScore','gpuScore','memoryScore','uxScore'],[int(number(v)) for v in tables[subs][i][2:]])))
        assert sum(stats[k] for k in ['cpuScore','gpuScore','memoryScore','uxScore'])==stats['antutu']
        p=product(name,'smartphone',int(rank),url,stats,f'{ram} GB RAM · {storage} GB nel test')
        p['rank']=int(rank);p['sourceRank']=int(original)
        p['benchmarkSource']='https://www.antutu.com/web/ranking' if platform=='Android' else 'https://www.antutu.com/ranking/ios1.htm'
        p['benchmarkScope']='AnTuTu V11 · '+platform+' · raccolta 14/10/2026. La fonte espone 2026.8, etichetta non coerente con tutti i modelli; mese effettivo da chiarire.'
        if platform=='iOS':p['benchmarkScope']+=' iPhone, tablet esclusi. Ambito geografico da chiarire; valori degli allegati.'
        p['provenance'].update(benchmarkScore=stats['antutu'],sourceRank=int(original),benchmarkVersion='11',platform=platform,periodLabel='2026.8')
        p['note']='Configurazione memoria del campione AnTuTu; le altre capacità commerciali possono differire. Specifiche estese già presenti nell’archivio conservano le fonti precedenti.'
        if platform=='iOS':
            gpu=7 if chip=='A20 Pro' else 6 if chip in ('A19 Pro','A18 Pro','A17 Pro') else 5
            if name=='iPhone Air':gpu=5
            if name in ('iPhone 17e','iPhone 16e','iPhone 13') or name.startswith('iPhone SE'):gpu=4
            p['stats'].update(cpuCores=6,graphics='Apple GPU',gpuCores=gpu)
            p['cpuDetail']=[{'count':2,'type':'Super' if chip=='A20 Pro' else 'Performance','clock':''},{'count':4,'type':'Efficiency','clock':''}]
        else:
            p['stats']['cpuCores']=10 if 'Exynos' in chip else 8
            p['stats']['graphics']='Xclipse 960' if 'Exynos' in chip else 'Mali-G1 Ultra MC12' if 'Dimensity' in chip else 'Adreno 829' if name=='iQOO Z11 Turbo' else 'Qualcomm Adreno'
            p['stats']['gpuCores']=12 if 'Dimensity' in chip else None
            if 'Dimensity' in chip:clusters=[(1,'C1-Ultra','4,21 GHz'),(3,'C1-Premium','3,5 GHz'),(4,'C1-Pro','2,7 GHz')]
            elif 'Exynos' in chip:clusters=[(10,'Arm · ripartizione non consolidata','')]
            elif 'OC' in chip or 'Galaxy' in chip:clusters=[(8,'Oryon · clock della variante non consolidato','')]
            else:
                clock=('4,6 GHz','3,62 GHz') if 'Elite Gen 5' in chip else ('4,32 GHz','3,53 GHz') if 'Elite' in chip else ('3,8 GHz','3,32 GHz')
                clusters=[(2,'Oryon Prime',clock[0]),(6,'Oryon Performance',clock[1])]
            p['cpuDetail']=[dict(count=n,type=t,clock=f) for n,t,f in clusters]
            chiprow=next((row for row in tables[10] if ('Dimensity' in chip and 'Dimensity' in row[0]) or ('Exynos' in chip and 'Exynos' in row[0]) or row[0]==chip),tables[10][1] if 'Galaxy' in chip or 'OC' in chip else None)
            if chiprow:p['sources'] += [{'label':'Chip · fonte tecnica','url':u} for u in re.findall(r'\]\((https://[^\s]+)\)',chiprow[3])]
        p['stats']['clusters']=' + '.join(str(x['count'])+' '+x['type'] for x in p['cpuDetail'])
assert len(rows)==120 and len(set(p['id'] for p in rows))==120
out={'snapshot':'2026-10-14','products':rows}
(ROOT/'catalog/reference-120.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
runtime='''/* Generated by scripts/build-catalog.py from the checked-in Markdown. */
window.TECHREF_REFERENCE = DATA;
(() => {
  const d = window.TECHREF;
  for (const fresh of window.TECHREF_REFERENCE.products) {
    const index = d.products.findIndex(p => p.id === fresh.id);
    const old = index < 0 ? {} : d.products[index];
    const merged = {...old, ...fresh, stats: {...old.stats, ...fresh.stats},
      sources: [...fresh.sources, ...(old.sources || [])], legacySnapshot: old.snapshot || d.date};
    if (merged.stats.launchPrice && typeof merged.stats.tflops === 'number') merged.stats.valuePer100 = merged.stats.tflops / merged.stats.launchPrice * 100;
    if (index < 0) d.products.push(merged); else d.products[index] = merged;
  }
})();
'''.replace('DATA',json.dumps(out,ensure_ascii=False,separators=(',',':')))
(ROOT/'public/catalog-2026.js').write_text(runtime)
print('120 entries imported; legacy IDs preserved.')
