const P = {"date":"2026-10-12","instrument":"sensex","symbol":"BSE-6:BSE SENSEX","name":"Sensex","ref":72472.33,"open":null,"last_session":"2026-10-09","pdh":72669.2,"pdl":71739.49,"pdc":72472.33,"trends":{"D":"down","1H":"down","15m":"up"},"lines":[{"p":71292.88,"text":"\u200b2026 low 71,292.88 (1-Oct)","color":"#089981","w":2,"style":0,"valign":"top","halign":"left"},{"p":71327.75,"text":"\u200bPrev week low 71,327.75","color":"#089981","w":2,"style":0,"valign":"top","halign":"left"},{"p":71739.49,"text":"\u200bPDL 71,739.49 (Fri low)","color":"#089981","w":2,"style":0,"valign":"top","halign":"left"},{"p":72000.0,"text":"\u200b72,000 round","color":"#9598a1","w":1,"style":2,"valign":"top","halign":"left"},{"p":72472.33,"text":"\u200bPDC 72,472.33 (Fri close)","color":"#2962ff","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":72500.0,"text":"\u200b72,500 round","color":"#9598a1","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":72669.2,"text":"\u200bPDH 72,669.20 (Fri high)","color":"#f23645","w":2,"style":0,"valign":"bottom","halign":"left"},{"p":72693.97,"text":"\u200b1H swing high 72,693.97 (Thu)","color":"#f23645","w":1,"style":1,"valign":"bottom","halign":"left"},{"p":73000.0,"text":"\u200b73,000 round","color":"#9598a1","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":73067.81,"text":"\u200bPrev week high 73,067.81","color":"#f23645","w":2,"style":0,"valign":"bottom","halign":"left"},{"p":73477.28,"text":"\u200b1H swing high 73,477.28 (Wed)","color":"#f23645","w":1,"style":1,"valign":"bottom","halign":"left"}],"zones":[{"t0":1790567100,"t1":1791539940,"hi":73881.44,"lo":73477.28,"text":"\u200bR1 SUPPLY: 1H FVG + 73,500 (Mon)","color":"#f23645","alpha":0.25},{"t0":1791452700,"t1":1791539940,"hi":71739.49,"lo":71590.31,"text":"\u200bS1 DEMAND: 1H FVG + 15m FVG (Thu)","color":"#089981","alpha":0.25},{"t0":1791539940,"t1":1791539940,"hi":72092.78,"lo":71934.73,"text":"\u200bOTE 62-79% of Fri's leg (long side)","color":"#089981","alpha":0.1},{"t0":1790567100,"t1":1791539940,"hi":73477.77,"lo":73067.81,"text":"\u200bD bear FVG (28-Sep, unfilled part)","color":"#f23645","alpha":0.08}],"daily_source":"Dhan daily","layout":"Lemonn Layout - Nifty 50"};
const w = window.__tvWidget;
const sleep = ms => new Promise(r => setTimeout(r, ms));
if (w.layoutName() !== P.layout) {           // always the user's main layout, never whichever one is open
  const charts = await new Promise(r => w.getSavedCharts(r));
  const main = charts.find(x => x.name === P.layout);
  if (!main) throw new Error('layout not found: ' + P.layout + ' (have: ' + charts.map(x => x.name).join(', ') + ')');
  w.loadChartFromServer(main);
  for (let i = 0; i < 30 && w.layoutName() !== P.layout; i++) await sleep(500);
  await sleep(3000);
}
const c = w.activeChart();
if (c.symbol() !== P.symbol) { await new Promise(r => { c.setSymbol(P.symbol, () => r()); setTimeout(r, 8000); }); await sleep(1500); }
if (c.symbol() !== P.symbol) throw new Error('symbol switch failed: ' + c.symbol());
await new Promise(r => c.setResolution('1D', r)); await sleep(2500);
let removed = 0;
for (const s of c.getAllShapes()) { const t = c.getShapeById(s.id).getProperties().text || ''; if (t.startsWith('​')) { c.removeEntity(s.id); removed++; } }
const rgba = (h, a) => `rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;
for (const l of P.lines) await c.createShape({price: l.p}, {shape: 'horizontal_line', overrides: {linecolor: l.color, linewidth: l.w, linestyle: l.style, showLabel: true, text: l.text, textcolor: l.color, fontsize: 11, bold: l.w > 1, horzLabelsAlign: l.halign, vertLabelsAlign: l.valign}});
for (const z of P.zones) await c.createMultipointShape([{time: z.t0, price: z.hi}, {time: z.t1, price: z.lo}], {shape: 'rectangle', overrides: {color: z.color, backgroundColor: rgba(z.color, z.alpha), fillBackground: true, transparency: 0, linewidth: 1, extendRight: true, text: z.text, textColor: z.color, fontSize: 11, bold: true, horzLabelsAlign: 'right', vertLabelsAlign: 'top'}});
await new Promise(r => c.setResolution('15', r)); await sleep(2000);
const saved = await new Promise(res => { try { w.saveChartToServer(() => res('saved'), () => res('fail'), {}); } catch (e) { res('err ' + e.message); } setTimeout(() => res('timeout'), 8000); });
const ours = c.getAllShapes().map(s => c.getShapeById(s.id)).filter(sh => (sh.getProperties().text || '').startsWith('​'));
const got = ours.map(sh => sh.getPoints().map(p => p.price.toFixed(2)).join('-')).sort();
const want = P.lines.map(l => l.p.toFixed(2)).concat(P.zones.map(z => z.hi.toFixed(2) + '-' + z.lo.toFixed(2))).sort();
JSON.stringify({layout: w.layoutName(), symbol: c.symbol(), removed, drawn: ours.length, expected: want.length, exact: JSON.stringify(got) === JSON.stringify(want), saved, resolution: c.resolution(), title: document.title});