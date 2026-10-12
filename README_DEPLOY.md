# TechRef — Minimal / Particles

12 ottobre 2026. Sito statico completo: sei categorie, 558 schede, percorso GPU Focus, immagini e font locali. Nessun backend o chiave API necessario.

## Pubblicazione su Vercel

1. Estrai lo ZIP. Usa come cartella del progetto quella che contiene `vercel.json`.
2. Carica questa cartella in un repository Git e importalo in Vercel, oppure esegui `npx vercel` dalla cartella estratta e segui la configurazione del tuo account.
3. Impostazioni: **Framework Preset: Other**, **Output Directory: public**, nessun comando di build. La configurazione è già in `vercel.json`.
4. Dopo aver controllato il deployment di anteprima, pubblica in produzione dal tuo progetto Vercel o con `npx vercel --prod`.

Il pacchetto è pronto per il deployment; non include un deployment già effettuato nel tuo account.

## Aprire in locale

Dalla cartella estratta, esegui `python3 -m http.server 8080 --directory public` e visita `http://localhost:8080/`.

- `/` apre le categorie.
- `/focus/#/catalogo` apre le tre GPU in evidenza; «Tutte le GPU» apre l'archivio completo.
- `/#/categoria/gpu` apre direttamente l'archivio GPU.

I percorsi interni usano hash URL: non servono regole di riscrittura SPA.

## Contenuto

- `public/`: applicazione pronta da servire, HTML/CSS/JS modificabili direttamente.
- `public/assets/particles/`: sei PNG originali, 1536 × 1024, particelle monocromatiche su void nero.
- `public/assets/products/`: immagini dei fornitori già integrate.
- `public/focus/assets/`: font e relative licenze, licenza delle icone.
- `catalog/`: dati, fonti, provenienza delle immagini e prompt delle illustrazioni.
- `docs/`: note sull'esperienza e sugli asset.
- `FILE_MANIFEST.json`: dimensione e SHA-256 di ogni file del pacchetto.

## Navigazione

- Frecce o swipe destra/sinistra: cambia argomento.
- Frecce o swipe su/giù: cambia prodotto, conservando l'argomento.
- Nome dell'argomento: apre l'elenco completo delle sezioni.
- Valori: spiegazione al tocco, anticipazione all'hover.
- Tasto centrale e Ctrl/Cmd-clic: apertura nativa dei link. Tasto destro disabilitato.
- Nel percorso Focus, se il contenuto supera lo spazio disponibile, scorre normalmente; i gesti sulla navigazione inferiore continuano a cambiare prodotto.

## Dati e verifiche

Il catalogo mantiene lo snapshot precedente: non è aggiornato in tempo reale. Le lacune restano indicate come N/D. I prezzi GPU sono listini USA al lancio, non prezzi correnti; TFLOPS/prezzo è un rapporto di calcolo teorico, non di FPS. Le illustrazioni particellari identificano categorie, non rappresentano modelli specifici.

Test automatici superati: 3.347 viste dell'atlante, 15 viste Focus, gesti e menu, link locali, sintassi JS/CSS e integrità ZIP. I test di interazione simulano DOM ed eventi. La verifica visiva e il touch fisico non sono stati completati perché il browser disponibile restituiva timeout di protocollo.

Configurazione Vercel: https://vercel.com/docs/project-configuration/vercel-json
