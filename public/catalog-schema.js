/* Category vocabulary; source order and measured specifications are separate. */
(() => {
  const d = window.TECHREF;
  const f = (key, label, unit = "", note = "") => ({ key, label, unit, note });
  const sourceOrder = {
    key: "selectionPosition",
    label: "Selezione UserBenchmark",
    dir: "asc",
  };
  const common = [
    f(
      "selectionPosition",
      "Posizione nella selezione",
      "",
      "Ordine del catalogo di riferimento, non un punteggio di qualità.",
    ),
  ];
  const definitions = [
    {
      id: "cpu",
      name: "CPU",
      icon: "cpu",
      preview: "Core · thread · frequenza",
      note: "Ordine Speed Rank UserBenchmark. Posizioni 1–10 dagli allegati, 11–20 da evidenze indicizzate. Raccolta 14/10/2026. Core P/E, frequenze e watt non sono scale universali di prestazioni.",
      fields: [
        f(
          "cpuCores",
          "Core CPU",
          "core",
          "Unità di elaborazione fisiche. I core P privilegiano le prestazioni, gli E l’efficienza. Contarli non basta a confrontare architetture diverse.",
        ),
        f("clusters", "Composizione CPU"),
        f(
          "threads",
          "Thread",
          "",
          "Flussi di istruzioni gestibili dalla CPU. Non equivalgono al numero di core fisici.",
        ),
        f(
          "boost",
          "Boost massimo",
          "GHz",
          "Frequenza massima dichiarata, non garantita su tutti i core contemporaneamente.",
        ),
        f(
          "socket",
          "Socket",
          "",
          "Attacco della CPU alla scheda madre. Anche chipset e versione del BIOS devono supportare il modello.",
        ),
        f(
          "powerSpec",
          "Potenza dichiarata",
          "W",
          "Intel: potenza base / massima turbo. AMD: TDP. Le definizioni sono differenti; non è il consumo dell’intero PC.",
        ),
        f(
          "userBenchmark",
          "Average Bench · UserBenchmark",
          "%",
          "Indice arrotondato della fonte, ricavato da risultati indicizzati. Non è la percentuale di utilizzo della CPU.",
        ),
      ],
      sorts: [
        { ...sourceOrder, label: "Speed Rank · UserBenchmark" },
        { key: "cpuCores", label: "Core CPU", dir: "desc" },
      ],
    },
    {
      id: "ssd",
      name: "SSD",
      icon: "ssd",
      preview: "Capacità · lettura · scrittura",
      note: "Selezione UserBenchmark: ordine degli allegati, non classifica di velocità. Lettura/scrittura: massimi sequenziali dichiarati. Ogni capacità è una voce distinta; SKU rappresentativi. Raccolta 14/10/2026.",
      fields: [
        f(
          "capacity",
          "Capacità",
          "GB",
          "Spazio nominale decimale: 1 TB = 1000 GB. La capacità utilizzabile dipende da formattazione e sistema.",
        ),
        f(
          "read",
          "Lettura sequenziale",
          "MB/s",
          "Massimo dichiarato dal produttore in lettura sequenziale. Apertura di app, file piccoli e carichi reali seguono pattern diversi.",
        ),
        f(
          "write",
          "Scrittura sequenziale",
          "MB/s",
          "Massimo dichiarato in scrittura sequenziale. Può diminuire con cache esaurita, temperatura o unità piena.",
        ),
        f(
          "interface",
          "Interfaccia",
          "",
          "Il collegamento al computer. Generazione PCIe e numero di linee devono essere supportati dal sistema.",
        ),
        f(
          "form",
          "Formato",
          "",
          "Dimensione e forma fisica. M.2 2280 indica 22 × 80 mm; il formato da solo non garantisce compatibilità elettrica.",
        ),
        f(
          "tbw",
          "Endurance dichiarata",
          "TBW",
          "Quantità di scritture prevista dal limite di endurance della garanzia. Non è una data di guasto.",
        ),
        f(
          "sku",
          "SKU rappresentativo",
          "",
          "Codice del riferimento tecnico, non identificazione certificata del campione UserBenchmark. Verificare dissipatore, revisione e mercato.",
        ),
      ],
      sorts: [
        sourceOrder,
        { key: "read", label: "Lettura sequenziale", dir: "desc" },
        { key: "capacity", label: "Capacità", dir: "desc" },
      ],
    },
    {
      id: "ram",
      name: "RAM",
      icon: "ram",
      preview: "Kit · MT/s · latenza",
      note: "Selezione UserBenchmark, non classifica di velocità. MT/s e CL descrivono proprietà diverse. Alcune righe aggregano più famiglie commerciali; SKU e profili restano da identificare. Raccolta 14/10/2026.",
      fields: [
        f(
          "capacity",
          "Capacità del kit",
          "GB",
          "Somma della capacità dei moduli. Più RAM aiuta a mantenere dati e applicazioni in uso; non aumenta da sola la velocità.",
        ),
        f(
          "generation",
          "Generazione DDR",
          "",
          "DDR4 e DDR5 richiedono schede madri compatibili. Non sono moduli intercambiabili.",
        ),
        f(
          "kit",
          "Composizione del kit",
          "",
          "Numero di moduli × capacità di ogni modulo. Due moduli da 16 GB formano un kit da 32 GB.",
        ),
        f(
          "rate",
          "Velocità di trasferimento",
          "MT/s",
          "Milioni di trasferimenti al secondo. Non è la frequenza di clock in MHz; la velocità effettiva dipende anche dalla configurazione del sistema.",
        ),
        f(
          "cl",
          "Latenza CAS",
          "CL",
          "Cicli di clock fra la richiesta di una colonna e la disponibilità dei dati. Va letta insieme alla velocità di trasferimento.",
        ),
        f(
          "cas",
          "CAS teorica",
          "ns",
          "CL × 2000 / MT/s. È solo la componente CAS teorica, non la latenza completa della memoria.",
        ),
        f("sku", "SKU del kit"),
      ],
      sorts: [
        sourceOrder,
        { key: "rate", label: "Trasferimento · MT/s", dir: "desc" },
        { key: "capacity", label: "Capacità del kit", dir: "desc" },
      ],
    },
  ];
  d.categories.push(...definitions);
  for (const c of d.categories) {
    c.fields.push(...common);
    c.reference = ["gpu", "cpu", "ssd", "ram", "smartphone"].includes(c.id);
    c.archive = ["gpu", "smartphone"].includes(c.id);
    c.art =
      {
        cpu: "assets/particles/chip.png",
        ssd: "assets/stage/ssd.webp",
        ram: "assets/stage/ram.webp",
      }[c.id] || `assets/particles/${c.id}.png`;
  }
  const gpu = d.categories.find((c) => c.id === "gpu");
  gpu.sorts.unshift(sourceOrder);
  gpu.note =
    "Selezione UserBenchmark dal Markdown del 14/10/2026. TFLOPS FP32 teorici separati dal ranking: non sono FPS. Archivio storico e listini USA al lancio conservano le fonti precedenti. La GPU Laptop è una variante distinta.";
  const mobile = d.categories.find((c) => c.id === "smartphone");
  mobile.fields.push(
    f("memoryScore", "AnTuTu · memoria", "punti"),
    f("uxScore", "AnTuTu · UX", "punti"),
    f("cpuCores", "Core CPU", "core"),
    f("clusters", "Gruppi CPU"),
    f("graphics", "GPU"),
    f("gpuCores", "Unità GPU", "core"),
    f("testStorage", "Archiviazione del campione", "GB"),
    f("battery", "Autonomia dichiarata"),
  );
  mobile.note =
    "AnTuTu V11: due selezioni distinte da 20, Android e iPhone senza tablet. Snapshot 14/10/2026. Etichetta 2026.8 della fonte incoerente con alcuni modelli; periodo effettivo e geografia iOS da chiarire. Dati estesi dell’archivio conservano le fonti originarie.";
  d.categories.sort(
    (a, b) =>
      [
        "gpu",
        "cpu",
        "ram",
        "ssd",
        "smartphone",
        "schermi",
        "chip",
        "sensori",
        "console",
      ].indexOf(a.id) -
      [
        "gpu",
        "cpu",
        "ram",
        "ssd",
        "smartphone",
        "schermi",
        "chip",
        "sensori",
        "console",
      ].indexOf(b.id),
  );
  d.referenceSnapshot = "14 ottobre 2026";
})();
