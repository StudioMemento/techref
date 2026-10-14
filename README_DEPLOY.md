# TechRef

Applicazione statica del progetto **StudioMemento/techref**, servita su **https://techref.vercel.app/**. Revisione navigazione 10, 14 ottobre 2026.

120 riferimenti del Markdown integrati nelle sei selezioni GPU, CPU, SSD, RAM, Android e iPhone. Nove categorie e 619 prodotti complessivi, con archivio e ID precedenti conservati.

## Sviluppo

- `npm ci`
- `npm test`
- `npm run dev` → http://localhost:8080
- `npm run catalog` rigenera il catalogo di riferimento senza rete.

## Vercel

Progetto esistente `techref`, team `studio-memento-s-projects`. Framework Other, output `public`, nessuna installazione o build richiesta in deploy. Configurazione in `vercel.json`. Nessuna chiave API o backend.

Non creare un altro progetto per aggiornare questa esperienza. Verificare l’anteprima prima della promozione.

### Stato della ripresa del 14 ottobre 2026

Sorgenti recuperati e verificati: nove test di integrazione superati. Corretti l’illustrazione della memoria mobile, l’etichetta AnTuTu sui modelli dell’archivio e il caricamento della versione aggiornata dei gesti.

La scrittura nel repository GitHub è stata rifiutata dall’integrazione (403). La creazione dell’anteprima Vercel è stata bloccata dal controllo automatico perché richiede un’autorizzazione esplicita alla pubblicazione. Questo pacchetto contiene il risultato completo; la versione online e il ramo GitHub `main` restano precedenti a questa revisione. Prima di un futuro deploy da GitHub, sincronizzare questi sorgenti.

La navigazione è stata verificata mediante DOM ed eventi simulati. La verifica visiva in browser e il touch su dispositivo fisico non sono stati eseguiti in questa sessione.

## Navigazione

Categorie → elenco → prodotto. Su/giù: prodotto. Destra/sinistra: sezione. Swipe, frecce e tastiera sono equivalenti. Le sezioni hanno nomi visibili; il contatore apre l’elenco. I link conservano filtri e ordinamento. Il vecchio `/focus/` porta allo stesso lettore.

- [Architettura UX e dati](docs/NAVIGAZIONE-10.md)
- [Catalogo offline](docs/CATALOGO-120-2026-10-14.md)
- [Provenienza degli asset](docs/ASSETS.md)

I dati sono snapshot, non quotazioni o classifiche live. Le illustrazioni generiche non raffigurano i modelli specifici. Dettagli e fonti restano disponibili nelle schede.
