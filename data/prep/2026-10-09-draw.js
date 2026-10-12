const P = {"date":"2026-10-09","instrument":"nifty","symbol":"NSE-1:NIFTY 50","name":"Nifty","ref":22275.8,"open":22275.8,"last_session":"2026-10-08","pdh":22599.05,"pdl":22179.9,"pdc":22231.8,"trends":{"D":"down","1H":"down","15m":"down"},"lines":[{"p":22000.0,"text":"\u200b22,000 round","color":"#9598a1","w":1,"style":2,"valign":"top","halign":"left"},{"p":22100.0,"text":"\u200b22,100 round","color":"#9598a1","w":1,"style":2,"valign":"top","halign":"left"},{"p":22179.9,"text":"\u200bPDL 22,179.90 (Thu low) = 2026 low, swept 2-Apr low 22,182.55","color":"#089981","w":2,"style":0,"valign":"top","halign":"left"},{"p":22200.0,"text":"\u200b22,200 round","color":"#9598a1","w":1,"style":2,"valign":"top","halign":"left"},{"p":22217.3,"text":"\u200bPrev week low 22,217.30","color":"#089981","w":2,"style":0,"valign":"top","halign":"left"},{"p":22231.8,"text":"\u200bPDC 22,231.80 (Thu close)","color":"#2962ff","w":1,"style":2,"valign":"top","halign":"left"},{"p":22275.8,"text":"\u200bPre-open 22,275.80 (9:08)","color":"#ff9800","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":22599.05,"text":"\u200bPDH 22,599.05 (Thu high)","color":"#f23645","w":2,"style":0,"valign":"bottom","halign":"left"},{"p":22776.1,"text":"\u200bD swing high 22,776.10 (6-Oct)","color":"#f23645","w":1,"style":0,"valign":"bottom","halign":"left"}],"zones":[{"t0":1791441900,"t1":1791453540,"hi":22340.2,"lo":22291.1,"text":"\u200bR1 SUPPLY: 1H FVG + 15m FVG + 22,300 (Thu)","color":"#f23645","alpha":0.25},{"t0":1791438300,"t1":1791453540,"hi":22421.25,"lo":22351.85,"text":"\u200bR2 SUPPLY: 1H FVG + 15m FVG + 22,400 (Thu)","color":"#f23645","alpha":0.25},{"t0":1791437400,"t1":1791453540,"hi":22459.0,"lo":22437.1,"text":"\u200bR3 SUPPLY: 15m OB + OTE (Thu)","color":"#f23645","alpha":0.18},{"t0":1791431100,"t1":1791453540,"hi":22546.3,"lo":22494.35,"text":"\u200bR4 SUPPLY: 1H FVG + 15m FVG + 22,500 + OTE (Thu)","color":"#f23645","alpha":0.25},{"t0":1791365400,"t1":1791453540,"hi":22614.55,"lo":22593.75,"text":"\u200bR5 SUPPLY: 15m OB + 22,600 (Wed)","color":"#f23645","alpha":0.18},{"t0":1790567100,"t1":1791453540,"hi":23020.95,"lo":22809.35,"text":"\u200bD bear FVG (28-Sep, unfilled part)","color":"#f23645","alpha":0.08}],"daily_source":"Dhan daily","layout":"Lemonn Layout - Nifty 50"};
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