# TechRef — navigazione unificata

14 ottobre 2026. Evoluzione del progetto esistente StudioMemento/techref, produzione techref.vercel.app.

## Percorso

Categorie → elenco → prodotto. Nessun percorso GPU separato. I vecchi URL `/focus/` si risolvono sulle schede correnti.

Nove categorie: GPU, CPU, RAM, SSD, Mobile, Display, Chip mobile, Sensori, Console. GPU e Mobile aprono la selezione di riferimento da 20 (20 Android e 20 iPhone separati); «Archivio» conserva il catalogo precedente. CPU, SSD e RAM hanno 20 voci ciascuna. Totale archivio dopo integrazione: 619 prodotti, senza eliminare ID precedenti.

## Due assi, due indicatori

- Su/giù cambia prodotto nella lista corrente, mantenendo l’argomento quando disponibile.
- Destra/sinistra cambia argomento dello stesso prodotto.
- Il contatore verticale apre l’elenco dei prodotti. Le sezioni in basso hanno etichette visibili, indicatore attivo e frecce.
- Swipe, trascinamento, tastiera, pulsanti e rotella usano le stesse destinazioni. I gesti diagonali ambigui non attivano un cambio. Nessun riciclo fra fine e inizio lista.
- I dettagli lunghi scorrono normalmente. Il gesto verticale sull’illustrazione e i pulsanti restano disponibili per cambiare prodotto.
- Escape torna all’elenco. Ricerca, piattaforma, ordinamento e raccolta sono codificati nei link; ritorno e refresh conservano il contesto. Il focus torna al prodotto selezionato.
- I link restano nativi per tasto centrale e Ctrl/Cmd-clic. Tasto destro disabilitato come richiesto. Dialoghi e campi di ricerca non catturano i comandi di navigazione.

Desktop: stage a sinistra, dati a destra. Mobile: stage sopra e dati sotto, con navigazione sempre visibile. Le illustrazioni generiche preesistenti sono riutilizzate e indicate come tali. Ring, luce locale e particelle si dissolvono nel nero; l’effetto rispetta `prefers-reduced-motion`.

## Dati

`docs/CATALOGO-120-2026-10-14.md` è la fonte offline. `python3 scripts/build-catalog.py` genera `catalog/reference-120.json` e `public/catalog-2026.js`. Il catalogo base `public/data.js` resta intatto; il nuovo strato aggiorna gli ID corrispondenti e aggiunge i mancanti.

- Ordine UserBenchmark separato dai TFLOPS. SSD/RAM: «Selezione», non graduatoria di velocità.
- AnTuTu V11 Android/iOS separati; posizione iOS originale conservata; nessun tablet nel Top 20 iPhone.
- Benchmark, specifiche dichiarate e calcoli restano distinti. Nessuna percentuale GPU UserBenchmark inventata; CPU 1–10 senza Average Bench numerico.
- RTX 4090 Laptop: intervalli di potenza e FP32 conservati, senza attribuire il massimo a tutti i notebook.
- Core Apple specifici per variante; core Qualcomm non documentati restano null. Core P/E illustrati con un blocco per unità; nessuna equivalenza di prestazione implicita.
- Il dato RAM è MT/s; CAS teorica con formula esplicita. SKU SSD rappresentativi e gruppi RAM aggregati sono segnalati nelle fonti.
- Le informazioni aggiuntive e i prezzi storici già presenti conservano le fonti dell’archivio. La raccolta Markdown non certifica prezzi attuali.
- La data certa del catalogo è 14/10/2026. Etichetta AnTuTu “2026.8” e geografia iOS sono limiti conservati nelle note.

## Verifica

`npm ci && npm test`: nove test di integrazione sul DOM e sugli eventi, con verifica di tutti i percorsi prodotto esistenti, sezioni del nuovo catalogo, asset, ordinamento, tastiera, swipe simulati, collegamenti nativi e contesto nei link.

`/review.html` è una pagina di verifica responsive senza indicizzazione, con iframe della vera applicazione a 390×844, 320×568, 768×1024 e 1440×900. Non è collegata alla navigazione del prodotto.

I test sintetici non sostituiscono un test con touch fisico su telefono.
