// Shared helpers + reusable component builders.
// Builders only create DOM (synchronously, before the timeline is built);
// all motion lives in the scene scripts on the single root timeline.
(function () {
  const VO = window.VO;

  // ---- narration sync ----------------------------------------------------
  // Keyword cue: time of the Nth ASR word matching `token` inside a line,
  // plus the visual response delay (100-250 ms after the spoken keyword).
  function cue(lineId, token, nth = 1, delay = 0.15) {
    const line = VO.lines[lineId];
    if (!line) throw new Error("VO line missing: " + lineId);
    let seen = 0;
    for (const w of line.words) {
      if (w.w === token && ++seen === nth) return w.t + delay;
    }
    throw new Error(`VO cue not found: ${lineId} / ${token} #${nth}`);
  }
  const lineStart = (id) => VO.lines[id].start;
  const lineEnd = (id) => VO.lines[id].end;
  const scene = (id) => VO.scenes[id];

  // ---- formatting --------------------------------------------------------
  // Indian digit grouping (3,12,945) without relying on Intl locale data.
  function formatIndian(n) {
    const s = String(Math.round(n));
    if (s.length <= 3) return s;
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return rest + "," + last3;
  }

  // ---- DOM ---------------------------------------------------------------
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function place(node, x, y, w, h) {
    node.style.left = x + "px";
    node.style.top = y + "px";
    if (w != null) node.style.width = w + "px";
    if (h != null) node.style.height = h + "px";
    return node;
  }

  const ICONS = {
    check:
      '<svg viewBox="0 0 26 26" class="chk"><circle cx="13" cy="13" r="13" fill="#28B379"/><path d="M7.5 13.4l3.6 3.5 7.4-7.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" class="icon"><path d="M6.6 3.5h2.6l1.4 4-2 1.4a11 11 0 005.5 5.5l1.4-2 4 1.4v2.6a2 2 0 01-2.2 2A15.5 15.5 0 014.6 5.7a2 2 0 012-2.2z" fill="none" stroke="#0F7A50" stroke-width="2" stroke-linejoin="round"/></svg>',
    chat:
      '<svg viewBox="0 0 24 24" class="icon"><path d="M4 5.5h16v10H9l-5 4z" fill="none" stroke="#0F7A50" stroke-width="2" stroke-linejoin="round"/></svg>',
    eye:
      '<svg viewBox="0 0 24 24" class="icon"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" fill="none" stroke="#0F7A50" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#0F7A50"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" class="icon"><path d="M12 2.8l7.5 3v5.6c0 4.6-3.2 8.2-7.5 9.8-4.3-1.6-7.5-5.2-7.5-9.8V5.8z" fill="#E7F5EE" stroke="#0F7A50" stroke-width="1.8"/><path d="M8.6 12.2l2.3 2.3 4.6-4.8" fill="none" stroke="#0F7A50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock:
      '<svg viewBox="0 0 24 24" class="icon"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#fff" stroke="#4F5A54" stroke-width="2"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" fill="none" stroke="#4F5A54" stroke-width="2"/></svg>',
    arrow:
      '<svg viewBox="0 0 26 26"><path d="M5 13h15M14 7l6 6-6 6" fill="none" stroke="#062A1F" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wa: '<svg viewBox="0 0 24 24" class="icon"><circle cx="12" cy="12" r="9" fill="none" stroke="#28B379" stroke-width="2"/><path d="M8 16.8l.8-2.6M9.3 9.6c.4 2.6 2.4 4.6 5 5l1-1.2" fill="none" stroke="#28B379" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };
  function icon(name) {
    const w = el("span");
    w.innerHTML = ICONS[name];
    return w.firstChild;
  }

  // ---- components --------------------------------------------------------
  function customerHeader(c) {
    const row = el("div", "cust-head");
    const logo = el("img", "logo-slot");
    // Placeholder until the official customer logo is dropped in (same path).
    logo.src = `assets/logos/${c.id}.svg`;
    logo.alt = c.name + " logo";
    const meta = el("div", "cust-meta");
    meta.append(el("span", "eyebrow", c.label), el("span", "cust-name", c.name));
    row.append(logo, meta);
    return row;
  }

  function problemCopy(c) {
    const m = el("div", "mask problem-mask");
    m.setAttribute("data-layout-allow-overflow", ""); // intentional mask reveal
    const p = el("p", "problem line", c.problem);
    if (c.problem.length < 64) p.classList.add("short");
    m.append(p);
    return m;
  }

  function solutionCopy(c) {
    const wrap = el("div", "solution-wrap");
    wrap.append(el("span", "solution-mark"), el("p", "solution", c.solution));
    return wrap;
  }

  function bulletList(c) {
    const list = el("div", "bullets");
    list.append(el("span", "eyebrow", c.bulletsLabel));
    c.bullets.forEach((b) => {
      const row = el("div", "bullet");
      row.append(icon("check"), el("span", "", b));
      list.append(row);
    });
    return list;
  }

  function bulletCards(c) {
    const grid = el("div", "bullet-cards");
    c.bullets.forEach((b) => {
      const card = el("div", "bullet-card");
      card.append(icon("check"), el("span", "", b));
      grid.append(card);
    });
    return grid;
  }

  function metricTile(m) {
    const t = el("div", "metric" + (m.hero ? " hero" : ""));
    t.append(el("span", "accent"), el("span", "value", m.value), el("span", "label", m.label));
    return t;
  }

  function impactBlock(c) {
    const wrap = el("div");
    wrap.append(el("span", "eyebrow", "IMPACT"));
    const row = el("div", "impact-row");
    c.impact.forEach((m) => row.append(metricTile(m)));
    wrap.append(row);
    return wrap;
  }

  function waveform(n) {
    const w = el("div", "wave");
    for (let i = 0; i < n; i++) w.append(el("i"));
    return w;
  }

  function rmCard(label, rows = 2) {
    const card = el("div", "ui-card rm-card");
    const head = el("div", "rm-head");
    head.append(el("span", "avatar", label));
    const bars = el("div", "rm-bars");
    for (let i = 0; i < rows; i++) {
      const b = el("span", "bar");
      b.style.width = [72, 48, 60][i % 3] + "px";
      bars.append(b);
    }
    head.append(bars);
    card.append(head);
    return card;
  }

  // ---- motion helpers ----------------------------------------------------
  // Count-up that always lands on the exact source string.
  function countUp(tl, node, m, at, dur = 0.7) {
    if (m.count == null) return;
    const proxy = { v: 0 };
    const fmt = (v) => {
      if (m.decimals) return v.toFixed(m.decimals) + m.suffix;
      if (m.count >= 1000) return formatIndian(v) + m.suffix;
      return Math.round(v) + m.suffix;
    };
    tl.fromTo(
      proxy,
      { v: 0 },
      {
        v: m.count,
        duration: dur,
        ease: "power3.out",
        onUpdate: () => {
          node.textContent = proxy.v >= m.count ? m.value : fmt(proxy.v);
        },
      },
      at,
    );
  }

  // Seek-safe waveform: bar heights are a pure function of a tweened phase.
  function animateWave(tl, bars, at, dur, amp = 1) {
    const proxy = { p: 0, a: 0 };
    const draw = () => {
      bars.forEach((b, i) => {
        const s = 0.5 + 0.5 * Math.sin(proxy.p * (1.3 + (i % 4) * 0.37) + i * 1.7);
        b.style.transform = `scaleY(${(0.18 + 0.82 * s * proxy.a).toFixed(3)})`;
      });
    };
    tl.fromTo(proxy, { a: 0 }, { a: amp, duration: 0.35, ease: "power2.out", onUpdate: draw }, at);
    tl.fromTo(proxy, { p: 0 }, { p: dur * 9, duration: dur, ease: "none", onUpdate: draw }, at);
    return proxy;
  }

  // Stroke draw for SVG paths (length measured from path data, not layout).
  function prepDraw(path) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    return len;
  }
  function draw(tl, path, at, dur, ease = "power2.inOut") {
    const len = prepDraw(path);
    tl.fromTo(path, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease }, at);
  }

  window.HF = {
    cue,
    lineStart,
    lineEnd,
    scene,
    formatIndian,
    el,
    svgEl,
    place,
    icon,
    customerHeader,
    problemCopy,
    solutionCopy,
    bulletList,
    bulletCards,
    metricTile,
    impactBlock,
    waveform,
    rmCard,
    countUp,
    animateWave,
    draw,
    prepDraw,
  };
  window.Scenes = {};
})();
