# TechRef · immagini

## Set attivo — Minimal / Particles

Sei PNG originali generati per questa revisione: particelle bianche e argento, filamenti sottili, ampi margini neri, nessun testo o logo. Sono illustrazioni generiche di categoria. Foto ufficiali dei prodotti e diagrammi quantitativi mantengono il loro ruolo.

| Categoria | File nel sito | Soggetto |
|---|---|---|
| GPU | `assets/particles/gpu.png` | Forma orizzontale con due ventole particellari |
| Mobile | `assets/particles/smartphone.png` | Sagoma verticale luminosa |
| Display | `assets/particles/schermi.png` | Piano panoramico con onda particellare |
| Chip | `assets/particles/chip.png` | Die quadrato in prospettiva |
| Sensori | `assets/particles/sensori.png` | Anello ottico e superficie sensibile |
| Console | `assets/particles/console.png` | Monolite e controller |

Tutti i file sono PNG RGB da 1536 × 1024, circa 7,3 MiB complessivi. Gli originali non sono ritagliati o compressi nuovamente. Il fondo della pagina è `#000`; fusione screen e maschere CSS rendono i margini continui. La media sui bordi esterni è circa 0,06–0,07 su 255, quindi i PNG non sono dichiarati uniformemente neri pixel per pixel.

Percorsi di generazione, prompt completi, dimensioni e misure sono in `catalog/particle-visuals-v3.json`. Nella repository i percorsi del sito sono sotto `dist/`; nel pacchetto Vercel sotto `public/`.

Le 3 foto NVIDIA del percorso Focus sono conservate; le immagini ufficiali e di famiglia negli elenchi mantengono la provenienza in `catalog/asset-manifest.json`. Le illustrazioni non vengono presentate come fotografie del modello aperto.

## Archivio delle revisioni precedenti

### Set precedente — Demo 06

Sei nuovi placeholder generati con Imagegen: forme astratte in grafite e vetro fumé, argento tenue, particelle rade, margini neri. Nessun logo, testo o prodotto reale simulato. I prompt completi e i metadati di generazione sono in `catalog/category-visuals.json`.

| Categoria | File integrato | Forma |
|---|---|---|
| GPU | `dist/assets/void/gpu.webp` | Lastra orizzontale con accenni radiali |
| Mobile | `dist/assets/void/smartphone.webp` | Monolite verticale di vetro scuro |
| Display | `dist/assets/void/schermi.webp` | Piano sottile sospeso |
| Chip | `dist/assets/void/chip.webp` | Die quadrato in prospettiva |
| Sensori | `dist/assets/void/sensori.webp` | Iride ottica scura |
| Console | `dist/assets/void/console.webp` | Volumi verticali astratti |

1200 × 800 pixel, WebP, circa 51 KB complessivi. Immagini ispezionate; luminosità media del bordo inferiore a 0,05/255, massimo 1/255. Maschere radiali e fusione CSS completano la continuità con il nero puro dell’interfaccia. Nelle categorie il testo è sovrapposto con una sfocatura locale dello sfondo.

La Demo 06 usa il visual come immagine piana, senza cornice, particelle o lastra WebGL. Una maschera sfuma i bordi nello sfondo; l’immagine viene nascosta sui viewport troppo bassi per dare priorità ai dati. Il campo `cover.src` per prodotto può sostituirla senza modificare la navigazione.

Le fotografie ufficiali già presenti restano locali e compaiono nelle anteprime degli elenchi. URL originali, crediti e distinzione fra foto specifiche e immagini di famiglia sono conservati in `catalog/asset-manifest.json` e nei record prodotto. Nessuna immagine generata viene presentata come foto reale del prodotto.

Gli asset della Demo 04 in `dist/assets/categories/` sono conservati come archivio e non sono caricati dalla nuova esperienza.
