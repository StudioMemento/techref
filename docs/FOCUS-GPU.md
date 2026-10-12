# TechRef — percorso GPU

12 ottobre 2026 · Revisione 3

Il percorso parte dalla categoria GPU della home, apre `/focus/#/catalogo` e porta alle schede di GeForce RTX 5090, RTX 4090 e RTX 3090. Il catalogo completo resta raggiungibile dal link «Tutte le GPU». La selezione è indicata come «Schede video · in evidenza» nell’elenco di tre modelli.

## Esperienza

- Elenco dominato da nome e TFLOPS; immagine ufficiale all’hover e sempre visibile sui dispositivi senza hover.
- Scheda con cinque argomenti: Panoramica, Memoria, Calcolo, Energia, Prezzo. Il nome corrente apre un menu con tutte le destinazioni; la barra di punti resta cliccabile e accessibile.
- Destra/sinistra: cambia argomento. Su/giù: cambia GPU, conservando l’argomento.
- Le frecce verticali hanno titolo ed etichetta accessibile con il modello di destinazione. Il trascinamento mostra la destinazione prima del rilascio.
- Gesti attivi sul contenuto e sulla navigazione inferiore. Tocco sui dati: spiegazione; hover: anticipazione breve.
- Con contenuto più alto dello spazio disponibile, l’area di lettura scorre verticalmente. I comandi inferiori e i loro gesti restano disponibili per cambiare GPU. Questo evita di confondere la lettura con il cambio prodotto.
- Nomi degli argomenti, frecce e tastiera sono alternative ai gesti. Nessun passaggio ciclico oltre il primo/ultimo elemento.
- Ritorno all’elenco: ricerca, posizione e focus conservati. Escape torna all’elenco se non è aperta una spiegazione. Ricerca senza risultati con azione di ripristino.
- Link nativi per clic centrale e Ctrl/Cmd-clic. Menu contestuale disabilitato come richiesto.

## Direzione visiva

Reference prodotto: `image(20261010-112643).png`. Reference elenco: `image(20261010-112542).png`. Reference categorie: `image(20261010-112246).png`. Riesaminate prima delle modifiche. Fondo nero puro, foto NVIDIA esistenti, titolo leggero nella scheda e nomi più marcati nell’elenco.

Su richiesta, la revisione 3 riduce la navigazione a frecce, punti, argomento corrente e TFLOPS. I nomi completi restano nel selettore, nei tooltip e nelle etichette accessibili. La home usa sei nuove illustrazioni PNG particellari, 1536 × 1024, su nero puro CSS. Foto ufficiali e diagrammi quantitativi restano distinti. Nessun confronto dentro la scheda.

## Dati

Snapshot esistente del catalogo, senza nuove ricerche o ampliamenti. Le figure rappresentano quantità numeriche: un blocco = 2 GB, un punto = 256 core CUDA. Non sono rappresentazioni fisiche dei componenti.

Il prezzo è il listino USA storico al lancio; il rapporto esposto è TFLOPS FP32 per 100 dollari nominali. Non è una misura di FPS/prezzo o un prezzo di acquisto attuale. Fonti raggiungibili dalla scheda e dalle spiegazioni.

## Verifica e limite

`node tests/focus.cjs`: tutte le 15 viste, quattro direzioni di gesto, trascinamento sui dati e sulla navigazione, feedback con nome della destinazione, blocco dei clic dopo un gesto, limiti dell’elenco, scheda conservata, focus e stato della ricerca, gestione di URL sconosciuti, scorrimento verticale nativo quando necessario, dialoghi, selettore degli argomenti (anche selezione della voce corrente e clic modificati), link nativi e sintassi CSS.

`npm test --prefix tests`: regressioni dell’atlante esistente, motore dei gesti e fogli di stile. Il comando comprende ora anche la verifica del percorso GPU.

**Verifica visiva ancora bloccata.** Il nuovo tentativo nel browser cloud ha restituito timeout di protocollo (`Page.navigate`, `Emulation.setFocusEmulationEnabled`), anche sulla nuova scheda aperta verso l’anteprima locale già attiva. Nessuno screenshot dell’implementazione è stato ottenuto; layout, console e touch reale non sono stati validati. I controlli DOM non sostituiscono questi passaggi. Dettaglio in `design-qa.md`.
