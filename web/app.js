"use strict";
// Study Desk: reads knowledge/*.md, trade-log.csv and api/manifest.json, either live from `python3 tckb.py serve`
// or from the static copy that `python3 tckb.py build-site` writes. Every path is relative so the site also works
// under a sub-path such as GitHub Pages (user.github.io/repo/).

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const app = $("#app");
// Running from `tckb.py serve` on this machine, versus the published static copy.
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const FIX_HINT = LOCAL ? "Make sure the server is running (<code>python3 tckb.py serve</code>), then reload."
  : "Check your connection, then reload the page.";

const SETUPS = {
  "consolidation-breakout-followup": { key: "A", label: "Follow-up candle breakout" },
  "range-breakout-direct": { key: "A−", label: "Raw breakout (no follow-up)" },
  "pullback-first-green-candle": { key: "B", label: "Pullback, first green candle" },
  "liquidity-sweep-reversal": { key: "C", label: "Liquidity-sweep reversal" },
  "base-reversal-aggressive-or-confirm": { key: "D", label: "Reversal at a base" },
  "jodi-long-straddle": { key: "E", label: "Jodi (call + put together)" },
  "aggressive-continuation-entry": { key: "F", label: "Aggressive continuation" },
  "telegram-vip-call": { key: "G", label: "Telegram VIP call" },
  "breakout-close-confirm": { key: "H", label: "Breakout on a candle close" },
  "trend-re-entry": { key: "I", label: "Trend re-entry" },
  "range-chop-scalps": { key: "J", label: "Chop scalps in a range" },
  "late-re-entry-fade": { key: "", label: "Late re-entry" },
  "close-above-level-entry": { key: "", label: "Close above spot level (guest)" },
  "pullback-to-marked-zone": { key: "", label: "Pullback to marked zone (guest)" },
};
const KEY_TO_SLUG = Object.fromEntries(Object.entries(SETUPS).filter(([, v]) => v.key).map(([slug, v]) => [v.key, slug]));
const QUIZ_SETUPS = ["consolidation-breakout-followup", "range-breakout-direct", "pullback-first-green-candle",
  "liquidity-sweep-reversal", "base-reversal-aggressive-or-confirm", "breakout-close-confirm", "trend-re-entry", "aggressive-continuation-entry"];

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("tckb:" + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) { try { localStorage.setItem("tckb:" + key, JSON.stringify(value)); } catch { /* storage blocked */ } },
};

let DATA = null;
const textCache = new Map();

async function getText(path) {
  if (textCache.has(path)) return textCache.get(path);
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const text = await res.text();
  textCache.set(path, text);
  return text;
}

async function loadData() {
  const [manifestRes, csv, concepts] = await Promise.all([
    fetch("api/manifest.json", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("manifest"); return r.json(); }),
    getText("knowledge/trade-log.csv"),
    getText("knowledge/concepts.md"),
  ]);
  const trades = parseCSV(csv).map((t) => {
    const pts = parseFloat(String(t.result_pts).replace("~", ""));
    return { ...t, pts: Number.isFinite(pts) ? pts : null, sec: hmsToSec(t.offset) };
  });
  trades.sort((a, b) => (a.date + a.offset).localeCompare(b.date + b.offset));
  const conceptTitles = concepts.split("\n").filter((l) => l.startsWith("### ")).map((l) => l.slice(4).trim());
  DATA = { manifest: manifestRes, trades, conceptTitles };
}

/* ---------------- helpers ---------------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function slugify(s) {
  return s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80);
}
function hmsToSec(hms) {
  const parts = String(hms || "").split(":").map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? parts[0] * 3600 + parts[1] * 60 + parts[2] : null;
}
function frameToSec(name) {
  const m = /^(\d\d)(\d\d)(\d\d)\.jpg$/.exec(name);
  return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : null;
}
function fmtDate(date, opts = { weekday: "short", day: "numeric", month: "short" }) {
  const d = new Date(date + "T00:00:00");
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString("en-IN", opts);
}
function signed(n) { return (n >= 0 ? "+" : "−") + Math.abs(Math.round(n * 10) / 10); }
function titleCase(u) { return u.charAt(0) + u.slice(1).toLowerCase(); }
function ytLink(vid, sec) { return `https://www.youtube.com/watch?v=${encodeURIComponent(vid)}&t=${Math.max(0, sec || 0)}s`; }
function setupLabel(slug) { return SETUPS[slug]?.label || slug; }

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.filter((r) => r.length === header.length).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

function record(rows) {
  const r = { n: rows.length, w: 0, l: 0, o: 0, pts: {} };
  for (const t of rows) {
    if (t.outcome === "win") r.w++; else if (t.outcome === "loss") r.l++; else r.o++;
    if (t.pts != null) r.pts[t.underlying] = (r.pts[t.underlying] || 0) + t.pts;
  }
  return r;
}
function ptsText(pts) {
  const parts = Object.entries(pts).sort().map(([u, v]) => `${titleCase(u)} ${signed(v)}`);
  return parts.length ? parts.join(" · ") : "no points";
}
function recordHTML(r) {
  const other = r.o ? ` · ${r.o} unclear` : "";
  return `<span class="record"><b class="w">${r.w}W</b> / <b class="l">${r.l}L</b>${other} · ${esc(ptsText(r.pts))}</span>`;
}

// Signature: each trade is one candle; body height ~ sqrt(points), Sensex scaled to Nifty terms.
function tapeHTML(rows, { big = false, animate = false } = {}) {
  const cap = big ? 48 : 24;
  const candles = rows.map((t, i) => {
    const decided = t.outcome === "win" || t.outcome === "loss";
    const norm = t.pts == null ? 0 : t.underlying === "SENSEX" ? t.pts / 3 : t.pts;
    const h = decided ? Math.min(cap, (big ? 7 : 5) + Math.sqrt(Math.abs(norm)) * (big ? 6 : 3.2)) : 3;
    const cls = t.outcome === "win" ? "win" : t.outcome === "loss" ? "loss" : "flat";
    const tip = `${fmtDate(t.date)} ${t.ist || ""} · ${titleCase(t.underlying)} ${t.option} · ${t.pts == null ? "no points logged" : signed(t.pts) + " pts"}`;
    return `<a class="candle ${cls}" role="listitem" href="#/day/${esc(t.date)}" style="--h:${h.toFixed(1)}px;--i:${i}" title="${esc(tip)}" aria-label="${esc(tip)}"><i></i></a>`;
  }).join("");
  return `<div class="tape${big ? " big" : ""}${animate ? " animate" : ""}" role="list">${candles}</div>`;
}

function framesFor(vid) { return DATA.manifest.frames[vid] || []; }
function frameNear(trade, before = 900, after = 45) {
  let best = null;
  for (const f of framesFor(trade.video_id)) {
    const s = frameToSec(f);
    if (s == null || trade.sec == null) continue;
    if (s >= trade.sec - before && s <= trade.sec + after && (!best || s > best.s)) best = { f, s };
  }
  return best ? { src: `data/frames/${trade.video_id}/${best.f}`, sec: best.s } : null;
}
function streamsByDate() {
  const map = new Map();
  for (const s of DATA.manifest.streams) map.set(s.date, s);
  return map;
}

/* ---------------- markdown ---------------- */
function renderMarkdown(md, ctx = {}) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let para = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(" "), ctx)}</p>`); para = []; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { flush(); continue; }
    let m;
    if (line.trim().startsWith("```")) {
      flush();
      const lang = line.trim().slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      // ```svg blocks are diagrams authored in knowledge/*.md; they render as figures, not as source.
      if (lang === "svg") out.push(`<figure class="diagram">${code.join("\n")}</figure>`);
      else if (lang === "bias-worksheet") out.push(`<div class="bias-sheet" data-bias-sheet data-defaults="${esc(code.join(" ").trim())}"></div>`);
      else if (lang === "prep-zones") out.push('<div class="prep-zones" data-prep-zones></div>');
      else if (lang === "review-signals") out.push('<div class="review-signals" data-review-signals></div>');
      else if (lang === "review-summary") out.push('<div class="review-summary" data-review-summary></div>');
      else out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }
    if ((m = /^(#{1,4})\s+(.*)$/.exec(line))) {
      flush();
      const level = m[1].length;
      out.push(`<h${level} id="${slugify(m[2])}">${inline(m[2], ctx)}</h${level}>`);
    } else if (/^-{3,}\s*$/.test(line)) {
      flush(); out.push("<hr>");
    } else if (/^<\/?details>$|^<details open>$/.test(line.trim())) {
      flush(); out.push(line.trim());
    } else if ((m = /^<summary>(.*)<\/summary>$/.exec(line.trim()))) {
      flush(); out.push(`<summary>${inline(m[1], ctx)}</summary>`);
    } else if (line.startsWith(">")) {
      flush();
      const quote = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      i--;
      out.push(`<blockquote>${renderMarkdown(quote.join("\n"), ctx)}</blockquote>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      flush();
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      i--;
      out.push(`<ul>${items.map((it) => `<li>${inline(it, ctx)}</li>`).join("")}</ul>`);
    } else if (/^\s*\d+[a-z]?\.\s+/.test(line)) {
      flush();
      const items = [];
      while (i < lines.length && /^\s*\d+[a-z]?\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[a-z]?\.\s+/, ""));
      i--;
      out.push(`<ol>${items.map((it) => `<li>${inline(it, ctx)}</li>`).join("")}</ol>`);
    } else if (line.trim().startsWith("|")) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      i--;
      out.push(tableHTML(rows, ctx));
    } else {
      para.push(line.trim());
    }
  }
  flush();
  return out.join("\n");
}

function splitRow(row) {
  return row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}
function tableHTML(rows, ctx) {
  const body = rows.filter((r) => !/^[\s|:-]+$/.test(r));
  const [head, ...rest] = body;
  if (!head) return "";
  const th = splitRow(head).map((c) => `<th>${inline(c, ctx)}</th>`).join("");
  const trs = rest.map((r) => `<tr>${splitRow(r).map((c) => `<td>${inline(c, ctx)}</td>`).join("")}</tr>`).join("");
  return `<div class="tablewrap"><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

function inline(text, ctx) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\uE000${codes.length - 1}\uE000`; });
  s = esc(s);
  // Images first, or the link rule below would swallow the [alt](url) part. Only our own chart folders are allowed.
  s = s.replace(/!\[([^\]]*)\]\(((?:data\/reviews|data\/frames|data\/prep)\/[^)\s]+)\)/g, (_, alt, url) =>
    `<button type="button" class="thumb chart-img" data-src="${url}" data-caption="${alt}"><img loading="lazy" src="${url}" alt="${alt}"></button>`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => linkHTML(label, url.replace(/&amp;/g, "&")));
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(“"])\*([^*\s][^*]*?)\*(?=[\s.,;:)!?”"]|$)/g, "$1<em>$2</em>");
  return s.replace(/\uE000(\d+)\uE000/g, (_, i) => codeHTML(codes[+i], ctx));
}

function linkHTML(label, url) {
  const safe = /^(https?:|#|knowledge\/|\.?\/)/.test(url) ? url : "#";
  let href = safe;
  const md = /(?:^|\/)streams\/(\d{4}-\d{2}-\d{2})\.md$/.exec(url);
  if (md) href = `#/day/${md[1]}`;
  else if (/playbook\.md$/.test(url)) href = "#/playbook";
  else if (/concepts\.md$/.test(url)) href = "#/concepts";
  const external = /^https?:/.test(href);
  const cls = label.trim().startsWith("▶") ? ' class="ts"' : "";
  return `<a${cls} href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
}

function codeHTML(code, ctx) {
  if (/\.jpg$/.test(code) && !/\s/.test(code)) {
    let src = null;
    if (code.includes("data/frames/")) src = code.replace(/^.*?(data\/frames\/)/, "$1");
    else {
      const name = code.split("/").pop();
      for (const vid of ctx.videoIds || []) if (framesFor(vid).includes(name)) { src = `data/frames/${vid}/${name}`; break; }
    }
    const [, vid, file] = /data\/frames\/([^/]+)\/(.+)$/.exec(src || "") || [];
    if (src && framesFor(vid).includes(file)) {
      return `<button type="button" class="thumb" data-src="${esc(src)}" data-caption="${esc(code)}" aria-label="Open chart frame ${esc(file)}"><img loading="lazy" src="${esc(src)}" alt="Chart frame ${esc(file)}"></button>`;
    }
    return `<span class="thumb missing">${esc(code)}</span>`;
  }
  return `<code>${esc(code)}</code>`;
}

function wireThumbs(root) {
  $$(".thumb[data-src]", root).forEach((btn) => btn.addEventListener("click", () => openLightbox(btn.dataset.src, btn.dataset.caption)));
}
function openLightbox(src, caption) {
  const dlg = $("#lightbox");
  $("img", dlg).src = src;
  $("img", dlg).alt = caption || "Chart frame";
  $(".lb-caption", dlg).textContent = caption || "";
  if (typeof dlg.showModal === "function") dlg.showModal(); else window.open(src, "_blank");
}

/* ---------------- views ---------------- */
async function viewStart() {
  const mine = DATA.trades.filter((t) => t.host === "chinmay");
  const follow = mine.filter((t) => t.setup === "consolidation-breakout-followup");
  const raw = mine.filter((t) => t.setup === "range-breakout-direct");
  const rf = record(follow), rr = record(raw);
  const days = DATA.manifest.streams.length;
  const verified = mine.filter((t) => t.verified === "frame" || t.verified === "said").length;
  const learned = store.get("learned", []).filter((t) => DATA.conceptTitles.includes(t)).length;
  const { flat: smcLessons } = await smartCourse();
  const smcSeen = [...smcDone()].filter((k) => smcLessons.some((l) => l.label === k)).length;
  const quiz = store.get("quiz", { seen: 0, correct: 0 });
  const latest = [...DATA.manifest.streams].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  app.innerHTML = `
  <section class="hero">
    <p class="eyebrow">${days} trading days · ${mine.length} of his trades logged</p>
    <h1>One candle of <span>patience</span>.</h1>
    <p class="lede">He trades the same breakout two ways. When he waits for the follow-up candle it's his best setup. When he jumps in on the breakout candle itself, it hasn't worked once.</p>
    <div class="duel">
      <article class="duel-side good">
        <p class="eyebrow">Waits for the follow-up candle</p>
        <h2>${esc(setupLabel("consolidation-breakout-followup"))}</h2>
        <p class="big-record">${rf.w}–${rf.l}<small>${rf.o ? rf.o + " scratch · " : ""}${esc(ptsText(rf.pts))}</small></p>
        ${tapeHTML(follow, { big: true, animate: true })}
      </article>
      <article class="duel-side bad">
        <p class="eyebrow">Buys the breakout candle</p>
        <h2>${esc(setupLabel("range-breakout-direct"))}</h2>
        <p class="big-record">${rr.w}–${rr.l}<small>${esc(ptsText(rr.pts))}</small></p>
        ${tapeHTML(raw, { big: true, animate: true })}
      </article>
    </div>
    <p class="caption">Each candle is one real trade: green above the line is a win, red below is a loss, taller means more points. Select one to open that day. The clearest example is <a href="#/day/2026-08-06">6 Aug</a>: same level, seven minutes apart, −8.4 on the breakout candle and +57.2 on the follow-up, straight from his trade journal.</p>
    <ul class="facts">
      <li><b>${verified}/${mine.length}</b> trades verified by a chart frame or his own words</li>
      <li>Exits never use peaks or drawn targets</li>
      <li>Nifty and Sensex points kept apart</li>
    </ul>
  </section>

  <h2>Your study path</h2>
  <ol class="path">
    <li><a href="#/playbook"><h3>Read the setups</h3><p>His rules, each with its real record and the moments he explains them.</p></a></li>
    <li><a href="#/concepts"><h3>Learn the concepts</h3><p>${learned} of ${DATA.conceptTitles.length} marked as learned.</p><div class="meter" aria-hidden="true"><i style="width:${DATA.conceptTitles.length ? (100 * learned / DATA.conceptTitles.length).toFixed(0) : 0}%"></i></div></a></li>
    <li><a href="#/smart"><h3>Understand why it works</h3><p>${smcSeen} of ${smcLessons.length} lessons done in the smart money &amp; liquidity course.</p><div class="meter" aria-hidden="true"><i style="width:${(100 * smcSeen / smcLessons.length).toFixed(0)}%"></i></div></a></li>
    <li><a href="#/practice"><h3>Practice on real charts</h3><p>${quiz.seen ? `${quiz.correct} of ${quiz.seen} setups called correctly.` : "See his chart before an entry and name the setup."}</p></a></li>
  </ol>

  <h2>Latest days</h2>
  <ul class="day-list">${latest.map(dayRowHTML).join("")}</ul>`;
  hydrateDayTitles();
}

function dayRowHTML(stream) {
  const rows = DATA.trades.filter((t) => t.date === stream.date);
  const r = record(rows);
  return `<li><a href="#/day/${esc(stream.date)}">
    <span class="day-date">${esc(fmtDate(stream.date, { day: "numeric", month: "short" }))}<small>${esc(fmtDate(stream.date, { weekday: "long" }))}</small></span>
    <span class="day-title" data-title-for="${esc(stream.date)}">${stream.notes ? "…" : "No notes yet"}<small>${rows.length} trades · ${recordHTML(r)}</small></span>
    ${rows.length ? tapeHTML(rows) : '<span class="empty">No trades logged</span>'}
  </a></li>`;
}

async function hydrateDayTitles() {
  const byDate = streamsByDate();
  await Promise.all($$("[data-title-for]").map(async (el) => {
    const s = byDate.get(el.dataset.titleFor);
    if (!s?.notes) return;
    try {
      const md = await getText(s.notes);
      const h1 = (md.split("\n").find((l) => l.startsWith("# ")) || "").slice(2);
      const title = h1.includes("—") ? h1.split("—").slice(1).join("—").trim() : h1;
      el.firstChild.textContent = title || "Day notes";
    } catch { el.firstChild.textContent = "Notes unavailable"; }
  }));
}

async function viewPlaybook() {
  const md = (await getText("knowledge/playbook.md"))
    // Hide notes written for whoever maintains the file; the learner doesn't need them.
    .replace(/^Update this file as each stream is processed.*$/m, "")
    .replace(/ ?Regenerate the scorecard with `[^`]+`\./g, "")
    .replace(/ \(`python3 tckb\.py scorecard`\)/g, "");
  app.innerHTML = `<div class="layout-toc"><article class="prose" id="doc">${renderMarkdown(md)}</article><aside class="toc" aria-label="On this page"></aside></div>`;
  const doc = $("#doc");
  const mine = DATA.trades.filter((t) => t.host === "chinmay");
  for (const h of $$("h3", doc)) {
    const m = /^([A-J]−?)\.\s*(.+)$/.exec(h.textContent.trim());
    const slug = m && KEY_TO_SLUG[m[1]];
    if (!slug) continue;
    const title = m[2].split(":")[0].replace(/⭐.*$/, "").trim();
    h.textContent = `${m[1]}. ${title}`;
    const rows = mine.filter((t) => t.setup === slug);
    const box = document.createElement("div");
    box.className = "setup-stats";
    box.innerHTML = `${recordHTML(record(rows))}${rows.length ? tapeHTML(rows) : ""}`;
    h.after(box);
  }
  $(".toc").innerHTML = "<p class=\"eyebrow\">On this page</p>" + $$("h2, h3", doc)
    .map((h) => `<a class="${h.tagName === "H3" ? "sub" : ""}" href="#/playbook" data-jump="${h.id}">${esc(h.textContent)}</a>`).join("");
  $$(".toc a").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" }); }));
  wireThumbs(doc);
}

async function viewConcepts() {
  const md = await getText("knowledge/concepts.md");
  const [intro, ...parts] = md.split(/\n(?=### )/);
  const concepts = parts.map((p) => {
    const [first, ...rest] = p.split("\n");
    const title = first.slice(4).trim();
    return { title, body: rest.join("\n"), text: (title + " " + rest.join(" ")).toLowerCase() };
  });
  let learned = new Set(store.get("learned", []));
  let filter = "all";

  app.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${concepts.length} concepts</p><h1>Concepts</h1></div><p class="record" id="progress"></p></div>
    
    <div class="toolbar">
      <input type="search" id="q" placeholder="Search concepts" aria-label="Search concepts">
      <div class="seg" role="group" aria-label="Show">
        <button type="button" data-f="all" aria-pressed="true">All</button>
        <button type="button" data-f="todo" aria-pressed="false">To learn</button>
        <button type="button" data-f="done" aria-pressed="false">Learned</button>
      </div>
    </div>
    <div class="concepts">${concepts.map((c, i) => `
      <details class="concept" data-i="${i}">
        <summary><span class="chev" aria-hidden="true">▸</span><h3>${inline(c.title, {})}</h3>
          <button type="button" class="learned-toggle" data-title="${esc(c.title)}" aria-pressed="false">Mark learned</button></summary>
        <div class="body prose">${renderMarkdown(c.body)}</div>
      </details>`).join("")}
    </div>`;

  const apply = () => {
    const q = $("#q").value.trim().toLowerCase();
    $$(".concept").forEach((el) => {
      const c = concepts[+el.dataset.i];
      const isLearned = learned.has(c.title);
      const show = (!q || c.text.includes(q)) && (filter === "all" || (filter === "done") === isLearned);
      el.hidden = !show;
      if (q && show) el.open = true;
      const btn = $(".learned-toggle", el);
      btn.setAttribute("aria-pressed", String(isLearned));
      btn.textContent = isLearned ? "Learned ✓" : "Mark learned";
    });
    $("#progress").textContent = `${concepts.filter((c) => learned.has(c.title)).length} of ${concepts.length} learned`;
  };
  $("#q").addEventListener("input", apply);
  $$(".seg button").forEach((b) => b.addEventListener("click", () => {
    filter = b.dataset.f;
    $$(".seg button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    apply();
  }));
  $$(".learned-toggle").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const t = b.dataset.title;
    learned.has(t) ? learned.delete(t) : learned.add(t);
    store.set("learned", [...learned]);
    apply();
  }));
  apply();
}

function viewDays() {
  const streams = [...DATA.manifest.streams].sort((a, b) => b.date.localeCompare(a.date));
  app.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${streams.length} days processed</p><h1>Days</h1></div></div>
    ${streams.length ? `<ul class="day-list">${streams.map(dayRowHTML).join("")}</ul>` : '<p class="empty">No processed days yet. Run a backfill batch, then reload.</p>'}`;
  hydrateDayTitles();
}

async function viewDay(date) {
  const byDate = streamsByDate();
  const stream = byDate.get(date);
  const dates = [...byDate.keys()].sort();
  const idx = dates.indexOf(date);
  if (!stream) { app.innerHTML = `<p class="empty">No notes for ${esc(date)}. <a href="#/days">See all days</a>.</p>`; return; }
  const rows = DATA.trades.filter((t) => t.date === date);
  const ctx = { videoIds: stream.videos.map((v) => v.id) };
  const md = stream.notes ? await getText(stream.notes) : "# No notes yet";
  const digestName = `${date}-insights.md`;
  const digest = DATA.manifest.daily.includes(digestName) ? await getText(`knowledge/daily/${digestName}`) : null;

  app.innerHTML = `
    <nav class="daynav" aria-label="Day navigation">
      ${idx > 0 ? `<a href="#/day/${dates[idx - 1]}">← ${esc(fmtDate(dates[idx - 1]))}</a>` : "<span></span>"}
      <a href="#/days">All days</a>
      ${idx < dates.length - 1 ? `<a href="#/day/${dates[idx + 1]}">${esc(fmtDate(dates[idx + 1]))} →</a>` : "<span></span>"}
    </nav>
    <article class="prose" id="doc">${renderMarkdown(md, ctx)}</article>`;
  const doc = $("#doc");
  const h1 = $("h1", doc);
  const strip = document.createElement("div");
  strip.className = "day-strip";
  strip.innerHTML = rows.length ? `${recordHTML(record(rows))}${tapeHTML(rows)}` : '<span class="empty">No trades logged for this day.</span>';
  (h1 || doc.firstChild)?.after(strip);
  if (digest) {
    const box = document.createElement("details");
    box.className = "concept";
    box.innerHTML = `<summary><span class="chev" aria-hidden="true">▸</span><h3>Nightly digest</h3></summary><div class="body prose">${renderMarkdown(digest, ctx)}</div>`;
    strip.after(box);
  }
  wireThumbs(doc);
}

function viewTrades() {
  const all = DATA.trades;
  const uniq = (k) => [...new Set(all.map((t) => t[k]).filter(Boolean))].sort();
  const saved = store.get("tradeFilters", {});
  const selects = [
    ["setup", "Setup", uniq("setup"), setupLabel],
    ["outcome", "Outcome", uniq("outcome"), (v) => v],
    ["underlying", "Index", uniq("underlying"), titleCase],
    ["verified", "Evidence", uniq("verified"), (v) => v],
    ["host", "Host", uniq("host"), (v) => (v === "chinmay" ? "Chinmay Sir" : v === "trade-circuit" ? "Trade Circuit (guest)" : v)],
  ];
  app.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">knowledge/trade-log.csv</p><h1>Trade log</h1></div></div>
    <div class="toolbar">
      ${selects.map(([k, label, values, fmt]) => `<label><span class="sr">${label}</span>
        <select data-k="${k}" aria-label="${label}"><option value="">${label}: all</option>${values.map((v) => `<option value="${esc(v)}"${saved[k] === v ? " selected" : ""}>${esc(fmt(v))}</option>`).join("")}</select></label>`).join("")}
      <button type="button" class="btn" id="reset">Clear filters</button>
    </div>
    <div class="summary-bar" id="summary"></div>
    <div class="tablewrap"><table class="trades">
      <thead><tr><th>Date</th><th>Option</th><th>Setup</th><th>Entry → SL → Target</th><th>Exit</th><th>Result</th><th>Evidence</th><th>Watch</th></tr></thead>
      <tbody id="tbody"></tbody></table></div>`;

  const render = () => {
    const f = Object.fromEntries($$("select[data-k]").map((s) => [s.dataset.k, s.value]));
    store.set("tradeFilters", f);
    const rows = all.filter((t) => Object.entries(f).every(([k, v]) => !v || t[k] === v));
    $("#summary").innerHTML = rows.length
      ? `<span class="record">${rows.length} trades</span>${recordHTML(record(rows))}${tapeHTML(rows)}`
      : "";
    $("#tbody").innerHTML = rows.length ? [...rows].reverse().map((t, i) => {
      const levels = [t.entry, t.sl, [t.target1, t.target2].filter(Boolean).join(" / ")].map((x) => x || "—").join(" → ");
      return `<tr class="main-row" data-i="${i}" tabindex="0" aria-expanded="false">
        <td class="num">${esc(fmtDate(t.date, { day: "numeric", month: "short" }))}<br><small>${esc(t.ist)}</small></td>
        <td>${esc(titleCase(t.underlying))} ${esc(t.option)}</td>
        <td>${esc(setupLabel(t.setup))}</td>
        <td class="num">${esc(levels)}</td>
        <td class="num">${esc(t.exit || "—")}</td>
        <td class="num res ${esc(t.outcome)}">${t.pts == null ? esc(t.outcome) : esc(signed(t.pts))}</td>
        <td><span class="pill ${esc(t.verified)}">${esc(t.verified)}</span></td>
        <td><a class="ts" href="${esc(ytLink(t.video_id, t.sec))}" target="_blank" rel="noopener">▶ ${esc(t.offset)}</a></td>
      </tr>
      <tr class="notes-row" hidden><td colspan="8">${esc(t.notes)}${frameCell(t)}</td></tr>`;
    }).join("") : `<tr><td colspan="8" class="empty">No trades match these filters. Clear a filter to see more.</td></tr>`;
    $$("tr.main-row").forEach((tr) => {
      const toggle = (e) => {
        if (e.target.closest("a")) return;
        const notes = tr.nextElementSibling;
        notes.hidden = !notes.hidden;
        tr.setAttribute("aria-expanded", String(!notes.hidden));
      };
      tr.addEventListener("click", toggle);
      tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(e); } });
    });
    wireThumbs($("#tbody"));
  };
  $$("select[data-k]").forEach((s) => s.addEventListener("change", render));
  $("#reset").addEventListener("click", () => { $$("select[data-k]").forEach((s) => (s.value = "")); render(); });
  render();
}
function frameCell(t) {
  const fr = frameNear(t, 900, 1200);
  return fr ? `<div><button type="button" class="thumb" data-src="${esc(fr.src)}" data-caption="${esc(`${t.date} ${t.option} · frame near entry`)}"><img loading="lazy" src="${esc(fr.src)}" alt="Chart frame near this entry"></button></div>` : "";
}

function viewPractice() {
  const pool = DATA.trades.filter((t) => t.host === "chinmay" && (t.outcome === "win" || t.outcome === "loss")
    && QUIZ_SETUPS.includes(t.setup) && frameNear(t));
  if (!pool.length) { app.innerHTML = '<p class="empty">No trades with a chart frame near their entry yet. Process more streams, then come back.</p>'; return; }
  const score = store.get("quiz", { seen: 0, correct: 0 });
  const trade = pool[Math.floor(Math.random() * pool.length)];
  const frame = frameNear(trade);
  const wrong = QUIZ_SETUPS.filter((s) => s !== trade.setup).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [trade.setup, ...wrong].sort(() => Math.random() - 0.5);
  const frameTime = frame.sec - (trade.sec ?? frame.sec);

  app.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">Practice · ${pool.length} real setups in the pool</p><h1>Call the setup</h1></div>
      <p class="score" id="score">${score.seen ? `${score.correct} of ${score.seen} correct` : "No answers yet"}</p></div>
    <div class="quiz">
      <figure class="quiz-frame">
        <button type="button" aria-label="Enlarge chart" data-src="${esc(frame.src)}"><img src="${esc(frame.src)}" alt="His chart around the entry"></button>
        <figcaption>${esc(fmtDate(trade.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" }))} · ${esc(titleCase(trade.underlying))} ${esc(trade.option)} · frame ${frameTime <= 0 ? `${Math.round(-frameTime / 60)} min before` : `${Math.round(frameTime / 60)} min after`} his entry. His position box may already be drawn.</figcaption>
      </figure>
      <section>
        <p class="eyebrow">Question</p>
        <h2 style="margin-top:0">Which setup is he taking here?</h2>
        <div class="choices">${options.map((o) => `<button type="button" class="choice" data-s="${esc(o)}">${esc(setupLabel(o))}</button>`).join("")}</div>
        <div id="reveal"></div>
      </section>
    </div>`;
  $(".quiz-frame button").addEventListener("click", (e) => openLightbox(e.currentTarget.dataset.src, `${trade.date} ${trade.option}`));
  $$(".choice").forEach((btn) => btn.addEventListener("click", () => {
    const correct = btn.dataset.s === trade.setup;
    $$(".choice").forEach((b) => { b.disabled = true; if (b.dataset.s === trade.setup) b.classList.add("right"); });
    if (!correct) btn.classList.add("wrong");
    const s = store.get("quiz", { seen: 0, correct: 0 });
    s.seen++; if (correct) s.correct++;
    store.set("quiz", s);
    $("#score").textContent = `${s.correct} of ${s.seen} correct`;
    const levels = [trade.entry, trade.sl, [trade.target1, trade.target2].filter(Boolean).join(" / ")].map((x) => x || "—").join(" → ");
    $("#reveal").innerHTML = `<div class="reveal">
      <p class="eyebrow">${correct ? "Correct" : `It was: ${esc(setupLabel(trade.setup))}`}</p>
      <p class="verdict ${esc(trade.outcome)}">${trade.outcome === "win" ? "Won" : "Lost"} ${trade.pts == null ? "" : esc(signed(trade.pts)) + " pts"}</p>
      <p class="levels">${esc(levels)} · exit ${esc(trade.exit || "—")}</p>
      <p>${esc(trade.notes)}</p>
      <p><a class="ts" href="${esc(ytLink(trade.video_id, trade.sec))}" target="_blank" rel="noopener">▶ Watch him take it</a> · <a href="#/day/${esc(trade.date)}">Read the day</a></p>
      <button type="button" class="btn primary" id="next">Next chart</button>
    </div>`;
    $("#next").addEventListener("click", viewPractice);
    $("#next").focus();
  }));
}

/* ---------------- level up ---------------- */
// Sensex premiums run ~3x Nifty's, so expectancy uses Nifty-equivalent points.
function niftyEq(t) { return t.underlying === "SENSEX" ? t.pts / 3 : t.pts; }

function expectancyBy(rows, keyFn) {
  const groups = new Map();
  for (const t of rows) {
    if (t.pts == null || (t.outcome !== "win" && t.outcome !== "loss")) continue;
    const k = keyFn(t);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(t);
  }
  return [...groups].map(([key, list]) => {
    const wins = list.filter((t) => t.outcome === "win"), losses = list.filter((t) => t.outcome === "loss");
    const avg = (xs) => (xs.length ? xs.reduce((s, t) => s + niftyEq(t), 0) / xs.length : 0);
    const winRate = wins.length / list.length;
    const avgWin = avg(wins), avgLoss = avg(losses);
    return { key, n: list.length, wins: wins.length, losses: losses.length, winRate, avgWin, avgLoss, exp: winRate * avgWin + (1 - winRate) * avgLoss };
  });
}

function evidenceTablesHTML() {
  const mine = DATA.trades.filter((t) => t.host === "chinmay");
  const fmt = (n) => (n >= 0 ? "+" : "−") + Math.abs(n).toFixed(1);
  const setups = expectancyBy(mine, (t) => t.setup).filter((r) => r.n >= 3 && r.key !== "telegram-vip-call").sort((a, b) => b.exp - a.exp);
  const hours = expectancyBy(mine, (t) => (t.ist || "").slice(0, 2)).filter((r) => /^\d\d$/.test(r.key)).sort((a, b) => a.key.localeCompare(b.key));
  const row = (label, r) => `<tr><td>${label}</td><td class="num">${r.n}</td><td class="num">${Math.round(r.winRate * 100)}%</td>
    <td class="num">${r.wins ? fmt(r.avgWin) : "—"}</td><td class="num">${r.losses ? fmt(r.avgLoss) : "—"}</td><td class="num res ${r.exp >= 0 ? "win" : "loss"}">${fmt(r.exp)}</td></tr>`;
  const head = (first) => `<thead><tr><th>${first}</th><th>Trades</th><th>Win rate</th><th>Avg win</th><th>Avg loss</th><th>Expectancy</th></tr></thead>`;
  return `
    <section class="evidence">
      <div>
        <h2>Expectancy by setup</h2>
        <p class="caption">Average points per decided trade, from his trade log. Setups with fewer than 3 decided trades are hidden.</p>
        <div class="tablewrap"><table class="trades">${head("Setup")}<tbody>${setups.map((r) => row(esc(setupLabel(r.key)), r)).join("")}</tbody></table></div>
      </div>
      <div>
        <h2>By hour of entry</h2>
        <p class="caption">Same numbers grouped by the IST hour he entered. Use it for "Know your best hours".</p>
        <div class="tablewrap"><table class="trades">${head("Hour")}<tbody>${hours.map((r) => row(`${r.key}:00`, r)).join("")}</tbody></table></div>
      </div>
      <p class="caption evidence-note">Points are Nifty-equivalent (Sensex ÷ 3), before costs, with scratches and unclear trades excluded. Small samples swing a lot, so treat these as leads to test, not proof.</p>
    </section>`;
}

async function viewLevelUp() {
  const md = await getText("knowledge/level-up.md");
  const [introBlock, ...sectionBlocks] = md.split(/\n(?=## )/);
  const sections = sectionBlocks.map((block) => {
    const [first, ...rest] = block.split("\n");
    const hacks = rest.join("\n").split(/\n(?=### )/).filter((h) => h.startsWith("### ")).map((h) => {
      const [title, ...body] = h.split("\n");
      const text = body.join("\n");
      const buildsOn = (/^\*\*Builds on:\*\*\s*(.+)$/m.exec(text) || [])[1] || "";
      return { title: title.slice(4).trim(), // Each **Label:** line becomes its own paragraph so the fields read as separate blocks.
      body: text.replace(/^\*\*Builds on:\*\*.*$/m, "").trim().replace(/\n(?=\*\*[A-Z][^*\n]*:\*\*)/g, "\n\n"), buildsOn, search: (title + " " + text).toLowerCase() };
    });
    return { title: first.slice(3).trim(), hacks };
  });
  const total = sections.reduce((n, s) => n + s.hacks.length, 0);
  let done = new Set(store.get("hacksLearned", []));
  let sectionFilter = "", statusFilter = "all";
  const intro = introBlock.replace(/^# .*\n/, "");

  app.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">Not from his streams · ${total} techniques</p><h1>Level up</h1></div><p class="record" id="hack-progress"></p></div>
    <div class="prose">${renderMarkdown(intro)}</div>
    ${evidenceTablesHTML()}
    <div class="toolbar">
      <input type="search" id="hq" placeholder="Search techniques" aria-label="Search techniques">
      <select id="hsection" aria-label="Section"><option value="">All sections</option>${sections.map((s, i) => `<option value="${i}">${esc(s.title)}</option>`).join("")}</select>
      <div class="seg" role="group" aria-label="Show">
        <button type="button" data-f="all" aria-pressed="true">All</button>
        <button type="button" data-f="todo" aria-pressed="false">To try</button>
        <button type="button" data-f="done" aria-pressed="false">Practised</button>
      </div>
    </div>
    ${sections.map((s, si) => `
      <section class="hack-section" data-section="${si}">
        <h2>${esc(s.title)}</h2>
        <div class="concepts">${s.hacks.map((h, hi) => `
          <details class="concept hack" data-s="${si}" data-h="${hi}">
            <summary><span class="chev" aria-hidden="true">▸</span>
              <span class="hack-title"><h3>${inline(h.title, {})}</h3>${h.buildsOn ? `<small>Builds on: ${inline(h.buildsOn, {})}</small>` : ""}</span>
              <button type="button" class="learned-toggle" data-title="${esc(h.title)}" aria-pressed="false">Mark practised</button></summary>
            <div class="body prose">${renderMarkdown(h.body)}</div>
          </details>`).join("")}
        </div>
      </section>`).join("")}`;

  const apply = () => {
    const q = $("#hq").value.trim().toLowerCase();
    $$(".hack").forEach((el) => {
      const h = sections[+el.dataset.s].hacks[+el.dataset.h];
      const isDone = done.has(h.title);
      const show = (!q || h.search.includes(q)) && (sectionFilter === "" || sectionFilter === el.dataset.s)
        && (statusFilter === "all" || (statusFilter === "done") === isDone);
      el.hidden = !show;
      if (q && show) el.open = true;
      const btn = $(".learned-toggle", el);
      btn.setAttribute("aria-pressed", String(isDone));
      btn.textContent = isDone ? "Practised ✓" : "Mark practised";
    });
    $$(".hack-section").forEach((sec) => { sec.hidden = !$$(".hack", sec).some((el) => !el.hidden); });
    const count = sections.flatMap((s) => s.hacks).filter((h) => done.has(h.title)).length;
    $("#hack-progress").textContent = `${count} of ${total} practised`;
  };
  $$(".hack .body p").forEach((para) => {
    const label = para.querySelector("strong")?.textContent;
    if (para.firstElementChild?.tagName === "STRONG" && label) para.classList.add("field-" + slugify(label));
  });
  $("#hq").addEventListener("input", apply);
  $("#hsection").addEventListener("change", (e) => { sectionFilter = e.target.value; apply(); });
  $$(".seg button").forEach((b) => b.addEventListener("click", () => {
    statusFilter = b.dataset.f;
    $$(".seg button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    apply();
  }));
  $$(".hack .learned-toggle").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const t = b.dataset.title;
    done.has(t) ? done.delete(t) : done.add(t);
    store.set("hacksLearned", [...done]);
    apply();
  }));
  apply();
}

/* ---------------- smart money course ---------------- */
let COURSE = null;
async function smartCourse() {
  if (COURSE) return COURSE;
  const md = await getText("knowledge/smart-money.md");
  const [head, ...blocks] = md.split(/\n(?=## )/);
  const modules = blocks.map((block) => {
    const [first, ...rest] = block.split("\n");
    const parts = rest.join("\n").split(/\n(?=### )/);
    const lead = parts[0].startsWith("### ") ? "" : parts.shift();
    const lessons = parts.filter((p) => p.startsWith("### ")).map((p) => {
      const [line, ...body] = p.split("\n");
      const text = body.join("\n").trim();
      const title = line.slice(4).trim();
      return {
        title,
        num: (/^([\d.]+)\s+/.exec(title) || ["", ""])[1],
        label: title.replace(/^[\d.]+\s+/, ""),
        goal: (/^\*\*Goal:\*\*\s*(.+)$/m.exec(text) || ["", ""])[1],
        // Each **Label:** line becomes its own paragraph, as in Level up.
        body: text.replace(/^\*\*Goal:\*\*.*$/m, "").trim().replace(/\n(?=\*\*[A-Z][^*\n]*:\*\*)/g, "\n\n"),
      };
    });
    return { title: first.slice(3).trim(), lead: lead.trim(), lessons };
  });
  const flat = [];
  modules.forEach((m, mi) => m.lessons.forEach((l) => { l.index = flat.length; l.mi = mi; l.module = m; flat.push(l); }));
  COURSE = { intro: head.replace(/^# .*\n/, "").trim(), modules, flat };
  return COURSE;
}

// Lessons are tracked by title without their number, so renumbering the course keeps your ticks.
// Older entries stored the numbered title ("5.2 The five gates"); strip the number when reading them.
const lessonKey = (title) => String(title).replace(/^[\d.]+\s+/, "");
function smcDone() { return new Set(store.get("smcDone", []).map(lessonKey)); }
function smcProgressHTML(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<div class="progress" role="img" aria-label="${done} of ${total} lessons done"><span style="width:${pct}%"></span></div>`;
}

async function viewSmart() {
  const { intro, modules, flat } = await smartCourse();
  const done = smcDone();
  const next = flat.find((l) => !done.has(l.label)) || flat[0];
  const started = done.size > 0;
  app.innerHTML = `
    <div class="page-head">
      <div><p class="eyebrow">Not from his streams · ${flat.length} lessons</p><h1>Smart money &amp; liquidity</h1></div>
      <p class="record">${done.size} of ${flat.length} done</p>
    </div>
    ${smcProgressHTML(done.size, flat.length)}
    <div class="prose">${renderMarkdown(intro)}</div>
    <div class="cta-card">
      <div><p class="eyebrow">${started ? "Continue" : "Start here"}</p>
        <h3>${esc(next.num)} ${esc(next.label)}</h3>
        <p>${inline(next.goal, {})}</p></div>
      <a class="btn primary" href="#/smart/${next.index}">${started ? "Continue" : "Start the course"}</a>
    </div>
    ${modules.map((m) => `
      <section class="course-module">
        <h2>${esc(m.title)}</h2>
        ${m.lead ? `<div class="prose">${renderMarkdown(m.lead)}</div>` : ""}
        <ol class="lesson-list">${m.lessons.map((l) => `
          <li class="${done.has(l.label) ? "is-done" : ""}">
            <a href="#/smart/${l.index}">
              <span class="ln">${esc(l.num || "•")}</span>
              <span class="lt">${esc(l.label)}</span>
              ${l.goal ? `<span class="lg">${esc(l.goal)}</span>` : ""}
            </a>
          </li>`).join("")}</ol>
      </section>`).join("")}`;
  wireThumbs(app);
}

async function viewSmartLesson(raw) {
  const { flat } = await smartCourse();
  const i = Math.max(0, Math.min(flat.length - 1, Number(raw) || 0));
  const l = flat[i], prev = flat[i - 1], next = flat[i + 1];
  const done = smcDone();
  app.innerHTML = `
    <div class="layout-toc">
      <article>
        <div class="page-head lesson-head">
          <div><p class="eyebrow">${esc(l.module.title)} · lesson ${i + 1} of ${flat.length}</p>
            <h1>${esc(l.label)}</h1></div>
        </div>
        ${l.goal ? `<p class="lede"><strong>Goal:</strong> ${inline(l.goal, {})}</p>` : ""}
        <div class="prose" id="lesson">${renderMarkdown(l.body)}</div>
        <div class="lesson-foot">
          ${prev ? `<a class="btn" href="#/smart/${prev.index}">← ${esc(prev.num || "Back")}</a>` : '<a class="btn" href="#/smart">← Contents</a>'}
          <button type="button" class="learned-toggle" id="smc-done" aria-pressed="${done.has(l.label)}">${done.has(l.label) ? "Done ✓" : "Mark done"}</button>
          ${next ? `<a class="btn primary" href="#/smart/${next.index}">${esc(next.num)} ${esc(next.label)} →</a>` : '<a class="btn primary" href="#/smart">Back to contents</a>'}
        </div>
      </article>
      <aside class="toc" aria-label="This module">
        <p class="eyebrow">${esc(l.module.title)}</p>
        ${l.module.lessons.map((x) => `<a href="#/smart/${x.index}" class="${x.index === i ? "here" : ""}${done.has(x.label) ? " is-done" : ""}">${esc(x.num)} ${esc(x.label)}</a>`).join("")}
        <p class="eyebrow" style="margin-top:18px"><a href="#/smart">All modules</a></p>
      </aside>
    </div>`;
  mountBiasSheets(app);
  $$("#lesson p").forEach((para) => {
    const label = para.querySelector("strong")?.textContent;
    if (para.firstElementChild?.tagName === "STRONG" && label) para.classList.add("field-" + slugify(label));
  });
  $("#smc-done").addEventListener("click", () => {
    const set = smcDone();
    set.has(l.label) ? set.delete(l.label) : set.add(l.label);
    store.set("smcDone", [...set]);
    const on = set.has(l.label);
    const btn = $("#smc-done");
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "Done ✓" : "Mark done";
  });
  wireThumbs(app);
}


/* ---------------- morning bias worksheet (```bias-worksheet in smart-money.md, lesson 5.2) ---------------- */
const BIAS_LEVELS = [
  ["pdh", "Yesterday's high"], ["pdl", "Yesterday's low"], ["pdc", "Yesterday's close"],
  ["open", "Pre-open or open price"], ["above", "Next zone above (Y)"], ["below", "Next zone below (Z)"],
  ["stop", "Your usual stop, index points"],
];
const BIAS_CHOICES = {
  structure: ["Daily structure, last 5–10 days", [["1", "Higher highs and higher lows"], ["0", "Overlapping — a range"], ["-1", "Lower highs and lower lows"]]],
  global: ["Crude and global tone", [["1", "Supportive"], ["0", "Mixed or unknown"], ["-1", "Negative (e.g. crude rising)"]]],
};
const fmtLevel = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

function biasRead(v) {
  const n = (k) => { const x = parseFloat(v[k]); return Number.isFinite(x) ? x : null; };
  const [pdh, pdl, pdc, open, above, below, stop] = ["pdh", "pdl", "pdc", "open", "above", "below", "stop"].map(n);
  const rows = [];
  let loc = 0;
  if (open != null && pdh != null && pdl != null) {
    loc = open > pdh ? 2 : open < pdl ? -2 : 0;
    rows.push([loc, open > pdh ? "Opening above yesterday's high" : open < pdl ? "Opening below yesterday's low" : "Opening inside yesterday's range — range first"]);
  } else rows.push([0, "Open vs yesterday: fill in yesterday's high, low and the open"]);
  const st = parseInt(v.structure ?? "0", 10) || 0;
  rows.push([st, `Daily structure: ${BIAS_CHOICES.structure[1].find(([k]) => k === String(st))[1].toLowerCase()}`]);
  let room = 0;
  if (open != null && above != null && below != null && stop != null && stop > 0) {
    const up = above - open, down = open - below, upOk = up >= 2 * stop, downOk = down >= 2 * stop;
    room = upOk && !downOk ? 1 : downOk && !upOk ? -1 : 0;
    rows.push([room, `Room: ${fmtLevel(up)} pts up, ${fmtLevel(down)} pts down (need ${fmtLevel(2 * stop)})`]);
  } else rows.push([0, "Room: fill in the zones above and below, and your stop"]);
  const gl = parseInt(v.global ?? "0", 10) || 0;
  rows.push([gl, `Crude and global tone: ${BIAS_CHOICES.global[1].find(([k]) => k === String(gl))[1].toLowerCase()}`]);
  const score = loc + st + room + gl;
  // X: the nearest of yesterday's levels to the open, unless you typed your own.
  const cands = [pdh, pdl, pdc].filter((x) => x != null);
  const auto = open != null && cands.length ? cands.reduce((a, b) => (Math.abs(b - open) < Math.abs(a - open) ? b : a)) : null;
  const X = n("x") ?? auto;
  const L = (x, fallback) => (x == null ? fallback : fmtLevel(x));
  let verdict, sentence;
  if (score >= 3) {
    verdict = "Favour calls";
    sentence = `Above ${L(X, "X")} I favour calls toward ${L(above, "Y")}. Below ${L(X, "X")} I take puts only after a clean break, toward ${L(below, "Z")}.`;
  } else if (score <= -3) {
    verdict = "Favour puts";
    sentence = `Below ${L(X, "X")} I favour puts toward ${L(below, "Z")}. Above ${L(X, "X")} I take calls only after a clean break, toward ${L(above, "Y")}.`;
  } else {
    verdict = "Range day";
    sentence = `Between ${L(below, "A")} and ${L(above, "B")} it's a range: calls near ${L(below, "A")}, puts near ${L(above, "B")}, nothing in the middle. A clean break of either edge makes it a trend day.`;
  }
  if ((v.standdown || "").trim()) sentence += ` Stand down: ${v.standdown.trim()}.`;
  return { rows, score, verdict, sentence, auto };
}

function mountBiasSheets(root) {
  $$("[data-bias-sheet]", root).forEach((el) => {
    let defaults = {};
    try { defaults = el.dataset.defaults ? JSON.parse(el.dataset.defaults) : {}; } catch { defaults = {}; }
    const todayISO = defaults.date || new Date().toLocaleDateString("en-CA");
    let date = todayISO;
    const sheets = () => store.get("biasSheets", {});
    const opts = (k) => BIAS_CHOICES[k][1].map(([val, label]) => `<option value="${val}">${esc(label)}</option>`).join("");
    el.innerHTML = `
      <div class="bs-head"><div><p class="eyebrow">Morning worksheet</p><h3>Build today's bias</h3></div>
        <label class="bs-date">Date <input type="date" data-date value="${todayISO}"></label></div>
      <div class="bs-grid">
        ${BIAS_LEVELS.map(([k, label]) => `<label>${esc(label)}<input type="number" step="any" inputmode="decimal" data-k="${k}"></label>`).join("")}
        <label>Your X (optional)<input type="number" step="any" inputmode="decimal" data-k="x" placeholder="auto"></label>
        ${Object.entries(BIAS_CHOICES).map(([k, [label]]) => `<label>${esc(label)}<select data-k="${k}">${opts(k)}</select></label>`).join("")}
        <label class="bs-wide">Stand down (events and times)<input type="text" data-k="standdown" placeholder="e.g. RBI policy 10:00, US CPI 18:00"></label>
      </div>
      <div class="bs-out" aria-live="polite"></div>
      <div class="bs-actions"><button type="button" class="btn primary" data-copy>Copy sentence</button>
        <button type="button" class="btn" data-clear>Clear this day</button>
        <span class="bs-note">Saved in this browser only.</span></div>`;
    const fields = $$("[data-k]", el);
    const load = () => {
      const v = sheets()[date] || (date === todayISO ? defaults : {});
      fields.forEach((f) => { f.value = v[f.dataset.k] ?? (f.tagName === "SELECT" ? "0" : ""); });
    };
    const read = () => Object.fromEntries(fields.map((f) => [f.dataset.k, f.value]));
    const show = () => {
      const v = read(), r = biasRead(v);
      $("[data-k='x']", el).placeholder = r.auto != null ? `auto: ${fmtLevel(r.auto)}` : "auto";
      const cls = r.score >= 3 ? "bull" : r.score <= -3 ? "bear" : "range";
      $(".bs-out", el).innerHTML = `
        <ul class="bs-factors">${r.rows.map(([pts, text]) => `<li><b class="${pts > 0 ? "w" : pts < 0 ? "l" : ""}">${pts > 0 ? "+" : ""}${pts}</b> ${esc(text)}</li>`).join("")}</ul>
        <p class="bs-verdict ${cls}">Score ${r.score > 0 ? "+" : ""}${r.score} · <strong>${r.verdict}</strong></p>
        <blockquote class="bs-sentence">${esc(r.sentence)}</blockquote>`;
      return r;
    };
    const save = () => { const all = sheets(); all[date] = read(); store.set("biasSheets", all); };
    fields.forEach((f) => f.addEventListener("input", () => { save(); show(); }));
    $("[data-date]", el).addEventListener("change", (e) => { date = e.target.value || todayISO; load(); show(); });
    $("[data-copy]", el).addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(show().sentence); btn.textContent = "Copied"; }
      catch { btn.textContent = "Select the sentence to copy"; }
      setTimeout(() => { btn.textContent = "Copy sentence"; }, 1600);
    });
    $("[data-clear]", el).addEventListener("click", () => {
      const all = sheets(); delete all[date]; store.set("biasSheets", all); load(); show();
    });
    load(); show();
  });
}


/* ---------------- chart reviews (knowledge/reviews/*.md + data/reviews/*.json from tools/market-review.py) ---------------- */
const fmtPx = (n) => Number(n).toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const rText = (r) => `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r).toFixed(2)}R`;
const RESULT = { target: ["hit 2R", "w"], stop: ["stopped", "l"], time: ["timed out", ""], open: ["still open", ""] };
async function reviewFacts(r) { return r.facts ? JSON.parse(await getText(r.facts)) : null; }

function signalsHTML(f) {
  if (!f || !f.signals || !f.signals.length) return '<p class="empty">The scanner found no setups on this day.</p>';
  const sig = f.signals;
  const net = sig.reduce((a, g) => a + g.r, 0);
  const rows = sig.map((g) => {
    const [label, cls] = RESULT[g.result];
    return `<tr><td class="num">${esc(g.code + g.n)}</td><td class="num">${esc(g.time)}</td><td>${esc(g.setup)}</td>
      <td>${g.dir === "long" ? "▲ long" : "▼ short"}</td><td class="num">${fmtPx(g.entry)}</td><td class="num">${fmtPx(g.stop)}</td>
      <td class="num">${g.risk}</td><td class="res ${cls}">${label} <small>${esc(g.exit_time)}</small></td>
      <td class="num res ${g.r > 0 ? "w" : g.r < 0 ? "l" : ""}">${rText(g.r)}</td><td class="why">${esc(g.text)}</td></tr>`;
  }).join("");
  const hits = sig.filter((g) => g.result === "target").length, stops = sig.filter((g) => g.result === "stop").length;
  return `<p class="record"><b>${sig.length}</b> setups · <b class="w">${hits} hit 2R</b> · <b class="l">${stops} stopped</b> · ${sig.length - hits - stops} timed out · net <b class="${net >= 0 ? "w" : "l"}">${rText(net)}</b></p>
    <div class="tablewrap"><table class="signals"><thead><tr><th>#</th><th>Time</th><th>Setup</th><th>Side</th><th>Entry</th><th>Stop</th><th>Risk</th><th>Result</th><th>R</th><th>Why it qualified</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

async function summaryHTML() {
  const reviews = DATA.manifest.reviews || [];
  const facts = (await Promise.all(reviews.map(reviewFacts))).filter(Boolean);
  const bySetup = {}, byType = {};
  for (const f of facts) {
    const type = f.day_type.replace(/ (up|down)$/, "");
    const t = (byType[type] ||= { days: 0, n: 0, r: 0 });
    t.days++;
    for (const g of f.signals || []) {
      const s = (bySetup[g.code] ||= { name: g.setup, n: 0, hit: 0, stop: 0, r: 0 });
      s.n++; s.r += g.r; if (g.result === "target") s.hit++; if (g.result === "stop") s.stop++;
      t.n++; t.r += g.r;
    }
  }
  const setupRows = Object.entries(bySetup).sort().map(([code, s]) => `<tr><td>${esc(code)} · ${esc(s.name)}</td><td class="num">${s.n}</td>
    <td class="num w">${s.hit}</td><td class="num l">${s.stop}</td><td class="num">${s.n - s.hit - s.stop}</td>
    <td class="num res ${s.r >= 0 ? "w" : "l"}">${rText(s.r)}</td><td class="num">${rText(s.r / s.n)}</td></tr>`).join("");
  const typeRows = Object.entries(byType).map(([type, t]) => `<tr><td>${esc(type)}</td><td class="num">${t.days}</td><td class="num">${t.n}</td>
    <td class="num res ${t.r >= 0 ? "w" : "l"}">${rText(t.r)}</td><td class="num">${t.n ? rText(t.r / t.n) : "—"}</td></tr>`).join("");
  const all = facts.flatMap((f) => f.signals || []);
  const tgtRows = ["1", "2", "3"].map((k) => {
    const rs = all.map((g) => g.r_by_target?.[k]).filter((x) => x != null);
    const net = rs.reduce((a, b) => a + b, 0);
    return `<tr><td>${k}R target</td><td class="num">${rs.filter((r) => r > 0).length} of ${rs.length}</td>
      <td class="num res ${net >= 0 ? "w" : "l"}">${rText(net)}</td><td class="num">${rs.length ? rText(net / rs.length) : "—"}</td></tr>`;
  }).join("");
  const riskRows = [["Stop 10 pts or less", (g) => g.risk <= 10], ["Stop over 10 pts", (g) => g.risk > 10]].map(([label, test]) => {
    const sub = all.filter(test), net = sub.reduce((a, g) => a + g.r, 0);
    return `<tr><td>${label}</td><td class="num">${sub.length}</td><td class="num">${sub.filter((g) => g.r > 0).length}</td>
      <td class="num res ${net >= 0 ? "w" : "l"}">${rText(net)}</td><td class="num">${sub.length ? rText(net / sub.length) : "—"}</td></tr>`;
  }).join("");
  return `<h3>Reward: the same trades with different targets</h3>
    <div class="tablewrap"><table class="signals"><thead><tr><th>Target</th><th>Winners</th><th>Net</th><th>Per trade</th></tr></thead><tbody>${tgtRows}</tbody></table></div>
    <h3>Risk: tight stops versus stops where the idea is wrong (2R target)</h3>
    <div class="tablewrap"><table class="signals"><thead><tr><th>Stop size</th><th>Trades</th><th>Won</th><th>Net</th><th>Per trade</th></tr></thead><tbody>${riskRows}</tbody></table></div>
    <h3>By setup, across ${facts.length} sessions</h3>
    <div class="tablewrap"><table class="signals"><thead><tr><th>Setup</th><th>Signals</th><th>Hit 2R</th><th>Stopped</th><th>Timed out</th><th>Net</th><th>Per trade</th></tr></thead><tbody>${setupRows}</tbody></table></div>
    <h3>By day type</h3>
    <div class="tablewrap"><table class="signals"><thead><tr><th>Day type</th><th>Days</th><th>Signals</th><th>Net</th><th>Per trade</th></tr></thead><tbody>${typeRows}</tbody></table></div>`;
}

async function mountReviewBlocks(root, facts) {
  for (const el of $$("[data-review-signals]", root)) el.innerHTML = signalsHTML(facts);
  for (const el of $$("[data-review-summary]", root)) el.innerHTML = await summaryHTML();
}

async function viewReviews() {
  const reviews = [...(DATA.manifest.reviews || [])].reverse();
  const md = await getText("knowledge/reviews/index.md");
  const facts = await Promise.all(reviews.map(reviewFacts));
  app.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">Nifty, one session per page · ${reviews.length} reviewed</p><h1>Chart reviews</h1></div></div>
    <ul class="review-list">${reviews.map((r, k) => {
      const f = facts[k];
      const sig = f?.signals || [];
      const net = sig.reduce((a, g) => a + g.r, 0);
      const title = r.title.includes("—") ? r.title.split("—").slice(1).join("—").trim() : r.title;
      return `<li><a href="#/review/${esc(r.date)}">
        <span class="day-date">${esc(fmtDate(r.date, { day: "numeric", month: "short" }))}<small>${esc(fmtDate(r.date, { weekday: "long" }))}</small></span>
        <span class="day-title">${esc(title)}<small>${f ? `${esc(f.day_type)} · range ${Math.round(f.range)} pts · gap ${f.gap > 0 ? "+" : ""}${Math.round(f.gap)} · ${sig.length} setups, net ${rText(net)}` : ""}</small></span>
      </a></li>`;
    }).join("")}</ul>
    <article class="prose" id="doc">${renderMarkdown(md.replace(/^# .*\n/, ""))}</article>`;
  await mountReviewBlocks(app, null);
}

async function viewReview(date) {
  const list = DATA.manifest.reviews || [];
  const k = list.findIndex((r) => r.date === date);
  if (k < 0) { app.innerHTML = '<p class="empty">No review for that day yet.</p>'; return; }
  const r = list[k], prev = list[k - 1], next = list[k + 1];
  const [md, facts] = await Promise.all([getText(r.notes), reviewFacts(r)]);
  app.innerHTML = `
    <nav class="daynav">${prev ? `<a href="#/review/${prev.date}">← ${esc(fmtDate(prev.date))}</a>` : "<span></span>"}
      <a href="#/reviews">All reviews</a>${next ? `<a href="#/review/${next.date}">${esc(fmtDate(next.date))} →</a>` : "<span></span>"}</nav>
    <article class="prose review" id="doc">${renderMarkdown(md)}</article>`;
  await mountReviewBlocks(app, facts);
  wireThumbs(app);
}


/* ---------------- next-session prep (knowledge/prep/*.md + data/prep/*.json) ---------------- */
function prepZonesHTML(p) {
  if (!p) return "";
  const kindLabel = { prev_high: "prev-day high", prev_low: "prev-day low", prev_close: "prev-day close", old_high: "older high",
    old_low: "older low", range_high: "range high", range_low: "range low", daily_gap: "unfilled daily gap", fvg_bull: "open bull FVG",
    fvg_bear: "open bear FVG", equal_highs: "untaken equal highs", equal_lows: "untaken equal lows", round: "round number" };
  const rows = p.zones.map((z) => {
    const price = z.hi - z.lo < 1 ? fmtPx(z.lo) : `${fmtPx(z.lo)}–${fmtPx(z.hi)}`;
    const cls = z.distance > 0 ? "l" : z.distance < 0 ? "w" : "";
    return `<tr class="${z.weight >= 3 ? "strong" : ""}"><td class="num">${price}</td><td class="num ${cls}">${z.distance > 0 ? "+" : ""}${z.distance.toFixed(0)}</td>
      <td>${esc(kindLabel[z.kind] || z.kind)}</td><td class="why">${esc(z.text)}</td><td class="num">${"●".repeat(z.weight)}</td></tr>`;
  }).join("");
  return `<div class="tablewrap"><table class="signals prep"><thead><tr><th>Price</th><th>From close</th><th>Kind</th><th>Where it comes from</th><th>Weight</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

async function viewPrep(date) {
  const list = DATA.manifest.preps || [];
  if (!list.length) { app.innerHTML = '<p class="empty">No session prep yet. The nightly run writes one for the next trading day.</p>'; return; }
  const k = date ? list.findIndex((r) => r.date === date) : list.length - 1;
  const r = list[Math.max(0, k)], prev = list[k - 1];
  const [md, facts] = await Promise.all([getText(r.notes), r.facts ? getText(r.facts).then(JSON.parse) : null]);
  app.innerHTML = `
    <nav class="daynav">${prev ? `<a href="#/prep/${prev.date}">← prep for ${esc(fmtDate(prev.date))}</a>` : "<span></span>"}<span></span></nav>
    <article class="prose review" id="doc">${renderMarkdown(md)}</article>`;
  for (const el of $$("[data-prep-zones]", app)) el.innerHTML = prepZonesHTML(facts);
  mountBiasSheets(app);
  wireThumbs(app);
}


/* ---------------- live (data/live/state.json from tools/live-monitor.py; local only) ---------------- */
let liveTimer = null;
const px0 = (n) => Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function liveLevels(st) {
  const lv = st.zones.filter((z) => z.weight >= 2).map((z) => ({ lo: z.lo, hi: z.hi, name: z.text }));
  lv.push({ lo: st.or_high, hi: st.or_high, name: "opening-range high" }, { lo: st.or_low, hi: st.or_low, name: "opening-range low" });
  if (!st.zones.length) lv.push({ lo: st.pdh, hi: st.pdh, name: "previous-day high" }, { lo: st.pdl, hi: st.pdl, name: "previous-day low" },
    { lo: st.prev_close, hi: st.prev_close, name: "previous-day close" });
  return lv.sort((a, b) => b.hi - a.hi);
}

function whereHTML(st) {
  const lv = liveLevels(st);
  const res = lv.filter((l) => l.lo > st.price + 1).sort((a, b) => a.lo - b.lo)[0];
  const sup = lv.filter((l) => l.hi < st.price - 1).sort((a, b) => b.hi - a.hi)[0];
  const lab = (l) => (l.hi - l.lo < 1 ? px0(l.lo) : `${px0(l.lo)}–${px0(l.hi)}`);
  if (!res || !sup) return `<p class="lv-sentence">Nifty is at <b>${fmtPx(st.price)}</b>, beyond every level on today's map.</p>`;
  const up = res.lo - st.price, down = st.price - sup.hi;
  const pos = Math.max(0, Math.min(100, (100 * down) / (down + up)));
  const where = pos < 25 ? "close to support" : pos > 75 ? "close to resistance" : "in the middle — the worst place to start a trade";
  return `<p class="lv-sentence">Nifty is <b>${where}</b>.</p>
    <div class="lv-range">
      <div class="lv-end sup"><span>Support</span><b>${lab(sup)}</b><small>${esc(sup.name)} · ${down.toFixed(0)} pts below</small></div>
      <div class="lv-bar"><i style="left:${pos}%"></i><em style="left:${pos}%">${fmtPx(st.price)}</em></div>
      <div class="lv-end res"><span>Resistance</span><b>${lab(res)}</b><small>${esc(res.name)} · ${up.toFixed(0)} pts above</small></div>
    </div>`;
}

function setupHTML(st) {
  const open = [...(st.signals || [])].reverse().find((g) => g.result === "open");
  const done = [...(st.signals || [])].reverse().find((g) => g.result !== "open");
  const last = done ? `<p class="caption">Last setup: <b>${esc(done.code + done.n)}</b> ${esc(done.setup)} at ${esc(done.time)} —
    ${{ target: "hit 2R", stop: "stopped", time: "timed out" }[done.result]} (${rText(done.r)}).</p>` : "";
  if (!open) {
    return `<div class="lv-card quiet"><p><b>No setup right now.</b> The rules are waiting for a sweep with a reversal candle, a break with a follow-up,
      or a pullback into a fresh gap.</p>${last}</div>`;
  }
  const long = open.dir === "long", p = open.option_plan;
  const progress = Math.max(0, Math.min(100, ((open.r + 1) / 3) * 100)); // -1R .. +2R
  return `<div class="lv-card ${long ? "long" : "short"}">
    <p class="lv-tag">${long ? "▲ LONG idea" : "▼ SHORT idea"} · ${esc(open.setup)} · formed ${esc(open.time)}</p>
    <p class="lv-why">${esc(open.text)}</p>
    <div class="lv-nums">
      <div><span>Entry</span><b>${fmtPx(open.entry)}</b></div>
      <div><span>Stop</span><b class="l">${fmtPx(open.stop)}</b><small>${open.risk} pts risk</small></div>
      <div><span>2R target</span><b class="w">${fmtPx(open.target)}</b></div>
      ${p ? (() => {
        const leg = st.options && (long ? st.options.ce_150 : st.options.pe_150);
        const now = leg && leg.strike === p.strike && leg.live_ltp != null ? ` · <b class="now">now ₹${leg.live_ltp}</b>` : "";
        return `<div class="opt"><span>${px0(p.strike)} ${long ? "CE" : "PE"} (rough plan)</span><b>₹${p.entry}</b><small>stop ₹${p.stop} · 2R ₹${p.target}${now}</small></div>`;
      })() : ""}
    </div>
    <div class="lv-progress"><div><i style="width:${progress}%"></i></div><small><span>−1R stop</span><span>now ${rText(open.r)}</span><span>+2R</span></small></div>
    <p class="caption">What the rules detected, not a recommendation. The decision is yours.</p></div>${last}`;
}

function timelineHTML(st) {
  const items = [...(st.alerts || [])].reverse().slice(0, 12);
  if (!items.length) return '<p class="caption">Nothing yet — the first update comes after the opening range (about 9:35).</p>';
  return `<ol class="lv-timeline">${items.map((a) => `<li class="k-${esc(a.kind || "event")}"><time>${esc(a.time)}</time>
    <div><b>${esc(a.short || a.title || "")}</b>${a.detail || a.text ? `<small>${esc(a.detail || a.text)}</small>` : ""}</div></li>`).join("")}</ol>`;
}

function optionsHTML(o) {
  if (!o) return "";
  if (o.error) return `<p class="caption">No option data: ${esc(o.error)}</p>`;
  const w = (list) => list.map((x) => px0(x.strike)).join(", ") || "—";
  const adds = [...o.call_oi_adds.slice(0, 1).map((x) => `${px0(x.strike)} CE`), ...o.put_oi_adds.slice(0, 1).map((x) => `${px0(x.strike)} PE`)].join(" · ");
  return `<div class="lv-chips">
      <span><small>Expiry</small>${esc(fmtDate(o.expiry))}</span>
      <span><small>ATM IV (CE / PE)</small>${o.atm_iv.ce?.toFixed(1) ?? "—"} / ${o.atm_iv.pe?.toFixed(1) ?? "—"}</span>
      <span><small>PCR</small>${o.pcr ?? "—"}</span>
      <span><small>Call wall (resistance)</small>${w(o.call_walls.slice(0, 1))}</span>
      <span><small>Put wall (support)</small>${w(o.put_walls.slice(0, 1))}</span>
      <span><small>Writers adding most</small>${adds}</span>
      ${o.ce_150 ? `<span><small>~₹150 call${o.ce_150.live_ltp != null ? " · live" : ""}</small>${px0(o.ce_150.strike)} CE ₹${o.ce_150.live_ltp ?? o.ce_150.ltp}</span>` : ""}
      ${o.pe_150 ? `<span><small>~₹150 put${o.pe_150.live_ltp != null ? " · live" : ""}</small>${px0(o.pe_150.strike)} PE ₹${o.pe_150.live_ltp ?? o.pe_150.ltp}</span>` : ""}
    </div><p class="caption">Updated ${esc(o.at)}.${o.note ? ` ${esc(o.note)}` : ""}</p>`;
}

function ladderHTML(st) {
  const rows = [];
  let placed = false;
  for (const l of liveLevels(st)) {
    if (!placed && l.hi < st.price) { rows.push(`<tr class="now"><td class="num">${fmtPx(st.price)}</td><td>price now</td><td></td></tr>`); placed = true; }
    const d = (l.lo + l.hi) / 2 - st.price;
    rows.push(`<tr><td class="num">${l.hi - l.lo < 1 ? fmtPx(l.lo) : `${fmtPx(l.lo)}–${fmtPx(l.hi)}`}</td><td>${esc(l.name)}</td>
      <td class="num ${d > 0 ? "l" : "w"}">${d > 0 ? "+" : ""}${d.toFixed(0)}</td></tr>`);
  }
  if (!placed) rows.push(`<tr class="now"><td class="num">${fmtPx(st.price)}</td><td>price now</td><td></td></tr>`);
  return `<div class="tablewrap"><table class="signals ladder"><tbody>${rows.join("")}</tbody></table></div>`;
}

const LIVE_HELP = `<dl class="lv-help">
  <dt>Where Nifty is</dt><dd>The nearest level below (support) and above (resistance), from this morning's prep and the opening range. Starting trades near an edge gives the best reward for the risk; the middle gives the worst.</dd>
  <dt>Setup right now</dt><dd>When one of the four scanner rules fires (sweep reversal, gap pullback, break with follow-up, failed break), its entry, stop and 2R target appear here, with a rough option price from the option's delta. The bar shows how far it has moved, from −1R (stop) to +2R (target).</dd>
  <dt>Today so far</dt><dd>Everything the rules noticed, newest first: prep levels reached, sweeps and breaks, setups forming and how they ended. The same messages arrive as Mac notifications.</dd>
  <dt>Options</dt><dd>From your Dhan account every 3 minutes: the strikes with the most open interest (where option writers defend), where writers are adding, implied volatility, and the strikes priced near ₹150. Context, not a trigger.</dd>
  <dt>Data</dt><dd>Nifty ticks stream from Dhan's live feed (WebSocket): the price updates every few seconds and each one-minute candle is checked the moment it closes. Dhan's official candles re-sync every 5 minutes. If the feed drops it polls Dhan once a minute, and Yahoo's public feed is the last resort. Levels are calculated on your Mac. The pill at the top shows the source and how fresh the data is.</dd>
</dl>`;

async function viewLive() {
  clearInterval(liveTimer);
  const start = '<pre><code>uv run --with websockets --with matplotlib python tools/live-monitor.py</code></pre>';
  if (!LOCAL) {
    app.innerHTML = `<div class="page-head"><div><p class="eyebrow">Local only</p><h1>Live</h1></div></div>
      <p class="lede">The live monitor runs on your own Mac and is never published. Open the Study Desk locally
      (<code>python3 tckb.py serve --open</code>), start the monitor, and this page updates every 20 seconds.</p>${start}`;
    return;
  }
  const render = async () => {
    if (!location.hash.startsWith("#/live")) { clearInterval(liveTimer); return; }
    let st = null;
    try { const r = await fetch("data/live/state.json", { cache: "no-store" }); if (r.ok) st = await r.json(); } catch { st = null; }
    const opened = new Set($$("details[data-key][open]", app).map((d) => d.dataset.key));
    const today = new Date().toLocaleDateString("en-CA");
    const updated = st ? new Date(st.updated) : null;
    const fresh = updated && (Date.now() - updated.getTime()) / 60000 < 3;
    if (!st) {
      app.innerHTML = `<div class="page-head"><div><p class="eyebrow">Nifty · rules running live</p><h1>Live</h1></div></div>
        <p class="lede">The monitor hasn't run yet. Start it from the project folder around 9:10:</p>${start}`;
      return;
    }
    const mode = st.replay && fresh ? "replay" : fresh && st.day === today ? "live" : "off";
    const pill = mode === "replay" ? `Replay · ${esc(fmtDate(st.day))} · ${esc(st.replay)}`
      : mode === "live" && st.tick_age_s != null ? `Live · ${esc(st.source || "Dhan")} · last tick ${st.tick_age_s < 60 ? `${st.tick_age_s}s` : `${Math.round(st.tick_age_s / 60)} min`} ago`
      : mode === "live" ? `Live · ${esc(st.source || "")} · polling · candle ${st.data_age_min ?? "?"} min old`
      : `Not running · last update ${esc(updated.toLocaleString("en-IN"))}`;
    const chg = st.price - st.prev_close, pct = (100 * chg) / st.prev_close;
    const section = (key, title, body) => `<details data-key="${key}" ${opened.has(key) ? "open" : ""}><summary>${title}</summary>${body}</details>`;
    app.innerHTML = `
      <div class="lv">
        <header class="lv-head">
          <div><p class="eyebrow">Nifty 50 · ${esc(fmtDate(st.day))}</p>
            <p class="lv-price">${fmtPx(st.price)} <span class="${chg >= 0 ? "w" : "l"}">${chg >= 0 ? "▲" : "▼"} ${Math.abs(chg).toFixed(1)} (${pct.toFixed(2)}%)</span></p>
            <p class="lv-sub">Open ${fmtPx(st.open)} · High ${fmtPx(st.high)} · Low ${fmtPx(st.low)}</p></div>
          <span class="lv-pill ${mode}">● ${pill}</span>
        </header>
        <section><h2>Where Nifty is</h2>${whereHTML(st)}</section>
        <section><h2>Setup right now</h2>${setupHTML(st)}</section>
        <section><h2>Today so far</h2>${timelineHTML(st)}</section>
        <section><h2>Options</h2>${optionsHTML(st.options)}</section>
        <div class="lv-more">
          ${section("levels", "All levels", ladderHTML(st))}
          ${section("setups", `All setups today (${(st.signals || []).length})`, `<div class="review-signals">${signalsHTML({ signals: st.signals })}</div>`)}
          ${section("chart", "Chart", `<button type="button" class="thumb chart-img" data-src="${esc(st.chart)}?t=${Date.now()}" data-caption="Live chart"><img loading="lazy" src="${esc(st.chart)}?t=${Date.now()}" alt="Live Nifty chart"></button>`)}
          ${section("help", "How to read this page", LIVE_HELP)}
        </div>
      </div>`;
    wireThumbs(app);
  };
  await render();
  liveTimer = setInterval(render, 3000); // a small local file; with the Dhan feed the price changes every few seconds
}

/* ---------------- levels ---------------- */
const LINE_TYPES = [["base", "Base"], ["barrier", "Barrier"], ["stop", "Stop"], ["target", "Target"]];
function priceNum(x) {
  const n = parseFloat(String(x ?? "").replace(/[~+]/g, ""));
  return Number.isFinite(n) ? n : null;
}
function frameInWindow(t, fromSec, toSec, latest) {
  let best = null;
  for (const f of framesFor(t.video_id)) {
    const s = frameToSec(f);
    if (s == null || t.sec == null || s < t.sec + fromSec || s > t.sec + toSec) continue;
    if (!best || (latest ? s > best.s : s < best.s)) best = { f, s };
  }
  return best ? { src: `data/frames/${t.video_id}/${best.f}`, sec: best.s } : null;
}
// Charts from 1–25 min before a single-option entry, with a later frame to reveal his box.
function levelsPool() {
  return DATA.trades.filter((t) => t.host === "chinmay" && !t.option.includes("+")
    && priceNum(t.entry) != null && priceNum(t.sl) != null && priceNum(t.target1) != null
    && !["telegram-vip-call", "jodi-long-straddle", "range-chop-scalps"].includes(t.setup)
    && frameInWindow(t, -1500, -60, true) && frameInWindow(t, 0, 1500, false));
}

async function viewLevels() {
  const md = await getText("knowledge/levels-guide.md");
  const poolSize = levelsPool().length;
  app.innerHTML = `<div class="layout-toc"><article class="prose" id="doc">${renderMarkdown(md)}</article><aside class="toc" aria-label="On this page"></aside></div>`;
  const doc = $("#doc");
  const cta = document.createElement("div");
  cta.className = "cta-card";
  cta.innerHTML = `<div><p class="eyebrow">Practice</p><h3>Draw the zones on his real charts</h3>
    <p>${poolSize} charts from before his entries. Mark the base, barrier, stop and target, then compare with what he did.</p></div>
    <a class="btn primary" href="#/levels/practice">Start drawing</a>`;
  const firstPara = $("h1 + p", doc);
  (firstPara || $("h1", doc) || doc.firstChild).after(cta);
  $(".toc").innerHTML = "<p class=\"eyebrow\">On this page</p>" + $$("h2, h3", doc)
    .map((h) => `<a class="${h.tagName === "H3" ? "sub" : ""}" href="#/levels" data-jump="${h.id}">${esc(h.textContent)}</a>`).join("");
  $$(".toc a").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" }); }));
  wireThumbs(doc);
}

function levelsScoreText(s) {
  if (!s.rounds) return "No charts drawn yet";
  return s.checked ? `${s.matched} of ${s.checked} prices matched · ${s.rounds} charts` : `${s.rounds} charts drawn`;
}

function viewLevelsPractice() {
  const pool = levelsPool();
  if (!pool.length) { app.innerHTML = '<p class="empty">No charts with frames before and after an entry yet. Process more streams, then come back.</p>'; return; }
  const t = pool[Math.floor(Math.random() * pool.length)];
  const before = frameInWindow(t, -1500, -60, true);
  const after = frameInWindow(t, 0, 1500, false);
  const minsBefore = Math.max(1, Math.round((t.sec - before.sec) / 60));
  const lines = [];
  let tool = "barrier";

  app.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">Levels practice · ${pool.length} charts</p><h1>Draw the zones</h1></div>
      <p class="score" id="lscore">${levelsScoreText(store.get("levelsQuiz", { rounds: 0, checked: 0, matched: 0 }))}</p></div>
    <p class="lede">This is his chart ${minsBefore} min before he entered the <strong>${esc(titleCase(t.underlying))} ${esc(t.option)}</strong>. Find that option's panel and mark where you'd put the base, the barrier he'd trade through, the stop and the first target.</p>
    <div class="quiz">
      <figure class="quiz-frame">
        <div class="draw-area" id="area"><img src="${esc(before.src)}" alt="His chart ${minsBefore} minutes before the entry" draggable="false"><div class="lines" id="lines"></div></div>
        <figcaption>${esc(fmtDate(t.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" }))} · Read prices from the right-hand axis of the ${esc(t.option)} panel.</figcaption>
      </figure>
      <section>
        <p class="eyebrow">Step 1 · Draw on the chart</p>
        <div class="seg" role="group" aria-label="Line type">${LINE_TYPES.map(([k, label]) =>
          `<button type="button" data-tool="${k}" aria-pressed="${k === tool}"><span class="tool-swatch hline-swatch ${k}"></span>${label}</button>`).join("")}</div>
        <p class="caption">Click the chart to place a line of the selected type. Click a line to remove it.</p>
        <div class="toolbar"><button type="button" class="btn" id="undo">Undo</button><button type="button" class="btn" id="clear">Clear lines</button></div>
        <p class="eyebrow">Step 2 · Write your prices (optional, scored)</p>
        <div class="level-inputs">
          <label>Entry trigger<input type="number" step="0.05" inputmode="decimal" id="in-entry"></label>
          <label>Stop loss<input type="number" step="0.05" inputmode="decimal" id="in-sl"></label>
          <label>First target<input type="number" step="0.05" inputmode="decimal" id="in-target"></label>
        </div>
        <button type="button" class="btn primary" id="reveal-btn">Reveal his levels</button>
        <div id="lreveal"></div>
      </section>
    </div>`;

  const area = $("#area");
  const draw = () => {
    $("#lines").innerHTML = lines.map((l, i) => {
      const label = LINE_TYPES.find(([k]) => k === l.type)[1];
      return `<button type="button" class="hline ${l.type}" style="top:${l.y.toFixed(2)}%" data-i="${i}" aria-label="Remove ${label} line"><span>${label}</span></button>`;
    }).join("");
    $$("#lines .hline").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); lines.splice(+b.dataset.i, 1); draw(); }));
  };
  area.addEventListener("click", (e) => {
    if (area.dataset.locked || e.target.closest(".hline")) return;
    const r = area.getBoundingClientRect();
    lines.push({ type: tool, y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) });
    draw();
  });
  $$("[data-tool]").forEach((b) => b.addEventListener("click", () => {
    tool = b.dataset.tool;
    $$("[data-tool]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  $("#undo").addEventListener("click", () => { lines.pop(); draw(); });
  $("#clear").addEventListener("click", () => { lines.length = 0; draw(); });

  $("#reveal-btn").addEventListener("click", () => {
    area.dataset.locked = "1";
    area.style.cursor = "default";
    $$("#reveal-btn, #undo, #clear, .level-inputs input, [data-tool]").forEach((el) => (el.disabled = true));
    const his = { entry: priceNum(t.entry), sl: priceNum(t.sl), target: priceNum(t.target1) };
    const score = store.get("levelsQuiz", { rounds: 0, checked: 0, matched: 0 });
    score.rounds++;
    const rows = [["Entry trigger", "entry", "#in-entry"], ["Stop loss", "sl", "#in-sl"], ["First target", "target", "#in-target"]].map(([label, key, sel]) => {
      const mine = parseFloat($(sel).value);
      const theirs = his[key];
      if (!Number.isFinite(mine)) return `<tr><td>${label}</td><td class="num">—</td><td class="num">${theirs}</td><td></td></tr>`;
      const tolerance = Math.max(2, theirs * 0.03);
      const ok = Math.abs(mine - theirs) <= tolerance;
      score.checked++; if (ok) score.matched++;
      return `<tr><td>${label}</td><td class="num">${mine}</td><td class="num">${theirs}</td><td class="num ${ok ? "ok" : "off"}">${ok ? "✓ close" : `✗ ${signed(mine - theirs)}`}</td></tr>`;
    }).join("");
    store.set("levelsQuiz", score);
    $("#lscore").textContent = levelsScoreText(score);
    $("#lreveal").innerHTML = `<div class="reveal reveal-grid">
      <p class="eyebrow" style="margin:0">His trade · ${esc(setupLabel(t.setup))}</p>
      <button type="button" class="thumb" style="display:block" data-src="${esc(after.src)}" data-caption="${esc(`${t.date} ${t.option} · after his entry`)}"><img src="${esc(after.src)}" alt="His chart after the entry, with his position box" style="width:100%;height:auto"></button>
      <div class="tablewrap"><table class="compare"><thead><tr><th></th><th>You</th><th>Him</th><th>Match (±3% or 2 pts)</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="verdict ${esc(t.outcome)}" style="margin:0">${t.outcome === "win" ? "Won" : t.outcome === "loss" ? "Lost" : "Unclear"}${t.pts == null ? "" : " " + esc(signed(t.pts)) + " pts"}</p>
      <p style="margin:0">${esc(t.notes)}</p>
      <p style="margin:0"><a class="ts" href="${esc(ytLink(t.video_id, t.sec))}" target="_blank" rel="noopener">▶ Watch him draw and take it</a> · <a href="#/levels">Back to the guide</a></p>
      <button type="button" class="btn primary" id="lnext">Next chart</button>
    </div>`;
    wireThumbs($("#lreveal"));
    $("#lnext").addEventListener("click", viewLevelsPractice);
    $("#lnext").focus();
  });
}

/* ---------------- router ---------------- */
const ROUTES = [
  [/^#?\/?$/, "start", () => viewStart()],
  [/^#\/levelup$/, "levelup", () => viewLevelUp()],
  [/^#\/smart$/, "smart", () => viewSmart()],
  [/^#\/live$/, "live", () => viewLive()],
  [/^#\/prep$/, "prep", () => viewPrep()],
  [/^#\/prep\/(\d{4}-\d{2}-\d{2})$/, "prep", (m) => viewPrep(m[1])],
  [/^#\/reviews$/, "reviews", () => viewReviews()],
  [/^#\/review\/(\d{4}-\d{2}-\d{2})$/, "reviews", (m) => viewReview(m[1])],
  [/^#\/smart\/(\d+)$/, "smart", (m) => viewSmartLesson(m[1])],
  [/^#\/levels$/, "levels", () => viewLevels()],
  [/^#\/levels\/practice$/, "levels", () => viewLevelsPractice()],
  [/^#\/playbook$/, "playbook", () => viewPlaybook()],
  [/^#\/concepts$/, "concepts", () => viewConcepts()],
  [/^#\/days$/, "days", () => viewDays()],
  [/^#\/day\/(\d{4}-\d{2}-\d{2})$/, "days", (m) => viewDay(m[1])],
  [/^#\/trades$/, "trades", () => viewTrades()],
  [/^#\/practice$/, "practice", () => viewPractice()],
];

async function route() {
  const hash = location.hash || "#/";
  const hit = ROUTES.map(([re, nav, fn]) => [re.exec(hash), nav, fn]).find(([m]) => m);
  const [match, nav, fn] = hit || [null, "start", () => viewStart()];
  $$("nav a[data-nav]").forEach((a) => {
    if (a.dataset.nav === nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  try {
    await fn(match);
  } catch (err) {
    app.innerHTML = `<div class="error"><h2 style="margin-top:0">This page couldn't load</h2><p>${esc(err.message)}</p><p>${FIX_HINT}</p></div>`;
  }
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

(async function start() {
  try {
    await loadData();
  } catch (err) {
    app.innerHTML = `<div class="error"><h2 style="margin-top:0">Couldn't load the knowledge base</h2><p>${FIX_HINT}</p><p class="mono">${esc(err.message)}</p></div>`;
    return;
  }
  // A chart that can't load almost always means the local server stopped; say so instead of leaving a blank box.
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.failed) return;
    img.dataset.failed = "1";
    const note = document.createElement("span");
    note.className = "img-missing";
    note.textContent = LOCAL ? "Chart didn't load. The Study Desk server may have stopped: run python3 tckb.py serve, then reload."
      : "Chart didn't load. Check your connection, then reload.";
    img.replaceWith(note);
  }, true);
  window.addEventListener("hashchange", route);
  route();
})();
