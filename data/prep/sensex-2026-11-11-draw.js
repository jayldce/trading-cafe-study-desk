const P = {"date":"2026-11-11","instrument":"sensex","symbol":"BSE-6:BSE SENSEX","name":"Sensex","ref":81106.65,"open":null,"last_session":"2026-11-09","pdh":81339.41,"pdl":80519.31,"pdc":81106.65,"trends":{"D":"up","1H":"up","15m":"up"},"lines":[{"p":80519.31,"text":"\u200bPDL 80,519.31 (Mon low)","color":"#089981","w":2,"style":0,"valign":"top","halign":"left"},{"p":81000.0,"text":"\u200b81,000 round","color":"#9598a1","w":1,"style":2,"valign":"top","halign":"left"},{"p":81106.65,"text":"\u200bPDC 81,106.65 (Mon close)","color":"#2962ff","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":81339.41,"text":"\u200bPDH 81,339.41 (Mon high)","color":"#f23645","w":2,"style":0,"valign":"bottom","halign":"left"},{"p":81442.11,"text":"\u200bPrev week high 81,442.11","color":"#f23645","w":2,"style":0,"valign":"bottom","halign":"left"},{"p":81500.0,"text":"\u200b81,500 round","color":"#9598a1","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":82000.0,"text":"\u200b82,000 round","color":"#9598a1","w":1,"style":2,"valign":"bottom","halign":"left"}],"zones":[{"t0":1794213900,"t1":1794218340,"hi":81064.68,"lo":81023.44,"text":"\u200bS1 DEMAND: 1H FVG + OTE (Mon)","color":"#089981","alpha":0.25},{"t0":1794210300,"t1":1794218340,"hi":80974.99,"lo":80883.87,"text":"\u200bS2 DEMAND: 1H FVG + 15m FVG (Mon)","color":"#089981","alpha":0.25},{"t0":1794212100,"t1":1794218340,"hi":80803.12,"lo":80765.34,"text":"\u200bS3 DEMAND: 15m FVG (Mon)","color":"#089981","alpha":0.18},{"t0":1793955600,"t1":1794218340,"hi":80519.31,"lo":80479.88,"text":"\u200bS4 DEMAND: 15m FVG + 80,500 (Fri)","color":"#089981","alpha":0.18},{"t0":1793951100,"t1":1794218340,"hi":80343.61,"lo":80135.93,"text":"\u200bS5 DEMAND: 1H FVG + 15m FVG (Fri)","color":"#089981","alpha":0.25},{"t0":1793936700,"t1":1794218340,"hi":80519.31,"lo":79470.03,"text":"\u200bD bull FVG (6-Nov, unfilled part)","color":"#089981","alpha":0.08}],"daily_source":"Dhan daily","layout":"Lemonn Layout - Nifty 50"};
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