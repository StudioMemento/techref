/* A single product reader for every category. Quantitative graphics use real data. */
(() => {
  "use strict";
  const D = window.TECHREF,
    E = window.TechRefExperience;
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const category = (id) => D.categories.find((c) => c.id === id);
  const present = (v) => v !== null && v !== undefined && v !== "";
  const number = (v) =>
    typeof v === "number"
      ? v.toLocaleString("it-IT", { maximumFractionDigits: 2 })
      : v;
  Object.assign(E.groups, {
    cpu: [
      [
        "overview",
        "Sintesi",
        ["selectionPosition", "cpuCores", "threads", "boost"],
      ],
      ["cpu", "Core", ["cpuCores", "clusters", "threads", "boost"]],
      ["platform", "Sistema", ["socket", "powerSpec"]],
      ["performance", "Test", ["userBenchmark", "selectionPosition"]],
    ],
    ssd: [
      ["overview", "Sintesi", ["capacity", "interface", "read"]],
      ["performance", "Velocità", ["read", "write"]],
      ["capacity", "Capacità", ["capacity", "tbw"]],
      ["platform", "Formato", ["form", "interface", "sku"]],
    ],
    ram: [
      ["overview", "Sintesi", ["capacity", "kit", "generation"]],
      ["performance", "Velocità", ["rate", "cl", "cas"]],
      ["platform", "Kit", ["kit", "generation", "capacity"]],
    ],
    smartphone: [
      ["overview", "Sintesi", ["antutu", "chip", "ram", "testStorage"]],
      [
        "performance",
        "Test",
        ["antutu", "cpuScore", "gpuScore", "memoryScore", "uxScore"],
      ],
      ["cpu", "Chip", ["cpuCores", "clusters", "graphics", "gpuCores"]],
      ["screen", "Display", ["size", "hz"]],
      ["camera", "Foto", ["camera"]],
      ["memory", "Memoria", ["ram", "testStorage", "storage", "battery"]],
    ],
  });
  const originalTopics = E.topics,
    originalPrimary = E.primary,
    originalInfo = E.info,
    originalVisual = E.visual;
  E.topics = (c, p) =>
    originalTopics(c).filter(
      (t) =>
        !p ||
        t.key === "overview" ||
        t.key === "wiki" ||
        t.keys.some((k) => present(p.stats[k])),
    );
  E.normalize = (c, key, p) => {
    const ts = E.topics(c, p);
    return ts.some((t) => t.key === key)
      ? key
      : ts.find((t) => t.key !== "overview" && t.keys.includes(key))?.key ||
          "overview";
  };
  E.primary = (p, section) => {
    const keys = {
      cpu: {
        overview: "cpuCores",
        cpu: "cpuCores",
        platform: "socket",
        performance: "userBenchmark",
      },
      ssd: {
        overview: "capacity",
        performance: "read",
        capacity: "capacity",
        platform: "form",
      },
      ram: { overview: "capacity", performance: "rate", platform: "kit" },
      smartphone: { cpu: "cpuCores", camera: "camera", memory: "ram" },
    };
    const preferred = keys[p.cat]?.[section] || originalPrimary(p, section);
    return present(p.stats[preferred])
      ? preferred
      : E.topics(category(p.cat), p)
          .find((t) => t.key === section)
          ?.keys.find((k) => present(p.stats[k])) || preferred;
  };
  E.info = (p, key) => {
    const old = originalInfo(p, key),
      f = E.field(p, key);
    if (f.note) old.text = f.note;
    if (key === "selectionPosition")
      old.text =
        p.cat === "cpu"
          ? "Posizione Speed Rank UserBenchmark nello snapshot. Non è una valutazione assoluta del prodotto."
          : "Ordine della selezione nel Markdown. Per SSD e RAM non è una classifica di velocità.";
    if (key === "testStorage")
      old.text =
        "Capacità di archiviazione del campione che ha eseguito il test. Non indica tutte le varianti in vendita.";
    if (key === "gpuCores")
      old.text =
        "Unità grafiche dichiarate per questa variante. I conteggi non sono confrontabili tra architetture e produttori diversi.";
    if (key === "cpuCores" && p.cat === "smartphone")
      old.text =
        "Core della CPU integrata nel chip. La struttura a gruppi è illustrata qui sotto; il loro numero non misura da solo la velocità.";
    if (key === "power" && p.cat === "cpu")
      old.text =
        "Intel: potenza base / massima turbo. AMD: TDP. Definizioni differenti, non consumo misurato del PC.";
    old.note = [old.note, p.snapshot ? "Raccolta " + p.snapshot : ""]
      .filter(Boolean)
      .join(" · ");
    return old;
  };
  E.chip = (p, key) => {
    const i = E.info(p, key);
    return `<button type="button" class="info-chip" data-action="info" data-id="${esc(p.id)}" data-key="${key}" aria-haspopup="dialog" aria-label="${esc(i.label + ": " + i.value + ". Spiegazione")}"><span>${esc(i.value)}</span><small>${esc(i.label)}</small><i aria-hidden="true">?</i></button>`;
  };
  E.chips = (p, keys) =>
    `<div class="info-chips">${keys
      .filter((k) => present(p.stats[k]))
      .map((k) => E.chip(p, k))
      .join("")}</div>`;
  E.tooltip = (p, key) => {
    const i = E.info(p, key);
    return `<span>${esc(i.label)}</span><strong>${esc(i.title)}</strong><p>${esc(i.text)}</p>${i.note ? `<small>${esc(i.note)}</small>` : ""}`;
  };
  const coreGraphic = (p) =>
    p.cpuDetail?.length
      ? `<figure class="core-map"><figcaption>Un blocco = un core CPU</figcaption>${p.cpuDetail.map((c, i) => `<div class="core-group"><div class="core-tiles tone-${i}" aria-hidden="true">${Array.from({ length: Math.min(c.count, 24) }, () => "<i></i>").join("")}</div><span><b>${c.count} ${esc(c.type)}</b>${c.clock ? `<small>${esc(c.clock)}</small>` : ""}</span></div>`).join("")}</figure>`
      : "";
  const scoreGraphic = (p) => {
    const keys = ["cpuScore", "gpuScore", "memoryScore", "uxScore"],
      names = ["CPU", "GPU", "MEM", "UX"];
    if (!keys.every((k) => typeof p.stats[k] === "number") || !p.stats.antutu)
      return "";
    return `<figure class="score-breakdown"><figcaption>Come si compone AnTuTu <span>${esc(p.stats.platform)} · V11</span></figcaption>${keys.map((k, i) => `<button class="score-line" data-action="info" data-id="${esc(p.id)}" data-key="${k}" aria-label="${names[i]}: ${number(p.stats[k])} punti. Spiegazione"><span>${names[i]}</span><i style="--portion:${(p.stats[k] / p.stats.antutu) * 100}%" aria-hidden="true"></i><b>${number(p.stats[k])}</b></button>`).join("")}<small>Lunghezza = quota del punteggio totale</small></figure>`;
  };
  const capacityGraphic = (p, key) => {
    const v = p.stats[key];
    if (typeof v !== "number" || v <= 0) return "";
    const unit = p.cat === "ssd" ? 250 : v > 64 ? 8 : v > 32 ? 4 : 2;
    return `<figure class="capacity-map"><figcaption>Un blocco = ${unit} GB</figcaption><div class="capacity-tiles" aria-label="${number(v)} GB">${Array.from({ length: Math.ceil(v / unit) }, (_, i) => `<i style="--fill:${Math.min(1, v / unit - i) * 100}%"></i>`).join("")}</div></figure>`;
  };
  const speedGraphic = (p) => {
    if (p.cat === "ssd")
      return `<figure class="speed-map"><figcaption>Débit séquentiel déclaré</figcaption>${[
        ["read", "Lettura"],
        ["write", "Scrittura"],
      ]
        .map(
          ([k, l]) =>
            `<div><span>${l}</span><i style="--portion:${(p.stats[k] / 16000) * 100}%"></i><b>${number(p.stats[k])} MB/s</b></div>`,
        )
        .join(
          "",
        )}<small>Scala 0–16.000 MB/s · massimi del produttore</small></figure>`.replace(
        "Débit séquentiel déclaré",
        "Trasferimento sequenziale",
      );
    return "";
  };
  E.visual = (p, section) => {
    if (section === "cpu" && (p.cat === "cpu" || p.cat === "smartphone"))
      return coreGraphic(p);
    if (section === "performance" && p.cat === "smartphone")
      return scoreGraphic(p);
    if (section === "performance" && p.cat === "ssd") return speedGraphic(p);
    if (
      (section === "memory" && ["gpu", "smartphone"].includes(p.cat)) ||
      section === "capacity"
    )
      return capacityGraphic(p, E.primary(p, section));
    if (section === "platform" && p.cat === "ram")
      return capacityGraphic(p, "capacity");
    return originalVisual(p, section);
  };
  const labels = {
    overview: "Sintesi",
    performance: "Test",
    cpu: "Chip",
    screen: "Display",
    camera: "Foto",
    memory: "Memoria",
    energy: "Energia",
    value: "Prezzo",
    platform: "Sistema",
    capacity: "Capacità",
    graphics: "GPU",
    motion: "Fluidità",
    detail: "Dettaglio",
    light: "Luce",
    technology: "Tecnologia",
    experience: "Uso",
    wiki: "Storia",
    identity: "Modello",
  };
  const topicLabel = (c, t) =>
    E.topics(c).find((x) => x.key === t)?.label || labels[t] || t;
  const asset = (p, key) => {
    const component =
      key === "cpu" || key === "graphics"
        ? "chip"
        : key === "camera"
          ? "camera"
          : key === "screen" || key === "motion"
            ? "display"
            : key === "memory" && p.cat === "smartphone"
              ? "ram"
              : null;
    const type =
      component ||
      {
        gpu: "gpu",
        cpu: "chip",
        ram: "ram",
        ssd: "ssd",
        smartphone: "phone",
        schermi: "monitor",
        chip: "chip",
        sensori: "camera",
      }[p.cat];
    return type ? `assets/stage/${type}.webp` : `assets/particles/${p.cat}.png`;
  };
  const shortName = (p) => p.short || p.name;
  function render({
    p,
    c,
    r,
    list,
    order,
    scope,
    motion,
    icon,
    href,
    btn,
    productPath,
  }) {
    const ts = E.topics(c, p),
      topic = ts.find((t) => t.key === r.key) || ts[0],
      pos = ts.indexOf(topic),
      index = list.indexOf(p),
      metric = E.primary(p, topic.key),
      field = E.field(p, metric);
    const score = present(p.stats[metric]) ? E.fmt(p, metric, false) : "—";
    const facts = topic.keys
      .filter(
        (k) =>
          k !== metric &&
          k !== "clusters" &&
          present(p.stats[k]) &&
          !(
            ["cpuScore", "gpuScore", "memoryScore", "uxScore"].includes(k) &&
            topic.key === "performance"
          ),
      )
      .slice(0, 3);
    const graphic = topic.key === "overview" ? "" : E.visual(p, topic.key);
    const visual = graphic && !graphic.includes("visual-empty") ? graphic : "";
    const name = shortName(p),
      rankLabel =
        order.key === "selectionPosition"
          ? c.id === "cpu"
            ? "Speed Rank"
            : "Selezione"
          : order.label;
    const productTarget = (other) =>
      productPath(other, E.normalize(c, topic.key, other));
    const step = (d) => {
      const other = list[index + d],
        label = d < 0 ? "precedente" : "successivo";
      return other
        ? href(
            productTarget(other),
            icon(d < 0 ? "up" : "down", 20),
            "rank-arrow",
            `data-step="${d}" aria-label="Prodotto ${label}: ${esc(other.name)}" title="${esc(other.name)}"`,
          )
        : `<button class="rank-arrow" disabled aria-label="${d < 0 ? "Primo" : "Ultimo"} prodotto">${icon(d < 0 ? "up" : "down", 20)}</button>`;
    };
    const arrow = (d) => {
      const t = ts[pos + d];
      return t
        ? href(
            productPath(p, t.key),
            icon(d < 0 ? "left" : "right", 18),
            "topic-arrow",
            `aria-label="Sezione ${d < 0 ? "precedente" : "successiva"}: ${esc(topicLabel(c, t.key))}"`,
          )
        : `<button class="topic-arrow" disabled aria-label="${d < 0 ? "Prima" : "Ultima"} sezione">${icon(d < 0 ? "left" : "right", 18)}</button>`;
    };
    const dots =
      list.length <= 24
        ? list
            .map((x, i) =>
              href(
                productTarget(x),
                "<i></i>",
                "rank-stop",
                `aria-label="${i + 1}. ${esc(x.name)}" ${x.id === p.id ? 'aria-current="true"' : ""} title="${i + 1}. ${esc(x.name)}"`,
              ),
            )
            .join("")
        : `<i class="rank-progress" style="--rank:${list.length > 1 ? (index / (list.length - 1)) * 100 : 0}%"></i>`;
    return `<section class="product-reader unified-reader" data-axis-surface="product" aria-label="${esc(p.name)}" aria-describedby="gesture-legend">
      <div class="xr-body reader-card ${motion}">
        <div class="xr-stage" aria-label="Illustrazione di ${esc(c.name)}">
          <div class="void-floor" aria-hidden="true"><div class="void-ring"></div></div>
          <img class="stage-object" src="${asset(p, topic.key)}" alt="Illustrazione generica, non fotografia di ${esc(p.name)}" draggable="false" fetchpriority="high" width="1254" height="1254">
          <div class="stage-particles" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="--x:${24 + ((i * 13) % 53)}%;--delay:${i * -1.1}s;--duration:${6 + (i % 4)}s"></i>`).join("")}</div>
          <span class="stage-caption">Illustrazione · ${esc(c.name)}</span>
        </div>
        <div class="xr-data" tabindex="-1">
          <header class="xr-title"><span class="eyebrow">${esc(p.brand)}${p.cat === "smartphone" ? " · " + (p.stats.platform === "iOS" ? "iPhone" : "Android") : ""}</span><h1>${esc(name)}</h1><p>${esc(p.variant)}</p></header>
          <div class="xr-topic"><span>${String(pos + 1).padStart(2, "0")} / ${String(ts.length).padStart(2, "0")}</span><h2>${esc(topicLabel(c, topic.key))}</h2>${btn("section-details", icon("plus", 17), "topic-details", `data-id="${esc(p.id)}" data-key="${topic.key}" aria-label="Approfondisci ${esc(topicLabel(c, topic.key))}"`)}</div>
          ${btn("info", `<strong class="${score.length > 18 ? "metric-text" : score.length > 9 ? "metric-long" : ""}">${esc(score)}</strong><span>${esc(field.unit ? field.unit + " · " + field.label : field.label)} ${icon("info", 13)}</span>`, "xr-metric", `data-id="${esc(p.id)}" data-key="${metric}" aria-label="${esc(field.label + ": " + E.fmt(p, metric) + ". Spiegazione")}" aria-haspopup="dialog"`)}
          ${E.chips(p, facts)}
          ${visual ? `<div class="xr-explanation">${visual}</div>` : ""}
          ${topic.key === "overview" && p.cat === "smartphone" && p.snapshot ? `<div class="overview-score"><span>AnTuTu V11 · ${esc(p.stats.platform)}</span><span>Raccolta 14.10.2026</span></div>` : ""}
          ${topic.key === "overview" && c.id === "cpu" ? `<p class="metric-caption">#${p.selectionPosition} · Speed Rank UserBenchmark</p>` : ""}
          ${["ssd", "ram"].includes(c.id) && topic.key === "overview" ? '<p class="metric-caption">Selezione UserBenchmark</p>' : ""}
          <div class="reader-source">${btn("sources", "Fonti e specifiche " + icon("link", 13), "text-button", `data-id="${esc(p.id)}"`)}${topic.key === "wiki" ? btn("wiki", "Mini wiki " + icon("right", 13), "text-button", `data-id="${esc(p.id)}"`) : ""}</div>
        </div>
      </div>
      <nav class="rank-rail" aria-label="Prodotti: ${esc(rankLabel)}">${step(-1)}${btn("ranking", `<strong>${String(index + 1).padStart(2, "0")}</strong><span>/ ${String(list.length).padStart(2, "0")}</span>`, "rank-position", `aria-haspopup="dialog" aria-label="Prodotto ${index + 1} di ${list.length}. Apri ${esc(rankLabel)}"`)}<div class="rank-stops">${dots}</div>${step(1)}<span class="rail-label">${esc(rankLabel)}</span></nav>
      <footer class="xr-footer"><div id="gesture-legend" class="gesture-legend">${btn("help", "↑ ↓ <span>Prodotti</span> &nbsp; ← → <span>Sezioni</span>", "gesture-help", 'aria-label="Come navigare"')}</div><nav class="topic-navigation" aria-label="Sezioni del prodotto">${arrow(-1)}<div class="topic-tabs">${ts.map((t) => href(productPath(p, t.key), `<i aria-hidden="true"></i><span>${esc(topicLabel(c, t.key))}</span>`, "topic-tab", `data-reader-tab="${t.key}" ${t.key === topic.key ? 'aria-current="page"' : ""}`)).join("")}</div>${arrow(1)}</nav></footer>
      <div class="swipe-destination" aria-hidden="true"></div>
    </section>`;
  }
  window.TechRefReader = { render, topicLabel, asset };
})();
