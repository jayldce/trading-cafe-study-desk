const P = {"date":"2026-11-06","instrument":"nifty","symbol":"NSE-1:NIFTY 50","name":"Nifty","ref":24536.6,"open":null,"last_session":"2026-11-05","pdh":24579.9,"pdl":24296.3,"pdc":24536.6,"trends":{"D":"up","1H":"up","15m":"range"},"lines":[{"p":24296.3,"text":"\u200bPDL 24,296.30 (Thu low)","color":"#089981","w":2,"style":0,"valign":"top","halign":"left"},{"p":24400.0,"text":"\u200b24,400 round","color":"#9598a1","w":1,"style":2,"valign":"top","halign":"left"},{"p":24536.6,"text":"\u200bPDC 24,536.60 (Thu close)","color":"#2962ff","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":24579.9,"text":"\u200bPDH 24,579.90 (Thu high)","color":"#f23645","w":2,"style":0,"valign":"bottom","halign":"left"},{"p":24600.0,"text":"\u200b24,600 round","color":"#9598a1","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":24700.0,"text":"\u200b24,700 round","color":"#9598a1","w":1,"style":2,"valign":"bottom","halign":"left"},{"p":24800.0,"text":"\u200b24,800 round","color":"#9598a1","w":1,"style":2,"valign":"bottom","halign":"left"}],"zones":[{"t0":1793864700,"t1":1793872740,"hi":24500.55,"lo":24475.95,"text":"\u200bS1 DEMAND: 1H FVG + 15m FVG + 24,500 (Thu)","color":"#089981","alpha":0.25},{"t0":1793861100,"t1":1793872740,"hi":24469.45,"lo":24420.95,"text":"\u200bS2 DEMAND: 1H FVG + 15m FVG (Thu)","color":"#089981","alpha":0.25},{"t0":1793850300,"t1":1793872740,"hi":24344.9,"lo":23960.6,"text":"\u200bS3 DEMAND: 1H FVG + 24,100 + 24,200 + 24,300 (Thu)","color":"#089981","alpha":0.25},{"t0":1793850300,"t1":1793872740,"hi":24305.35,"lo":23960.6,"text":"\u200bS4 DEMAND: 15m FVG + 24,100 + 24,200 + 24,300 (Thu)","color":"#089981","alpha":0.18},{"t0":1793785500,"t1":1793872740,"hi":24296.3,"lo":23926.75,"text":"\u200bS5 DEMAND: 15m FVG + 24,100 + 24,200 (Wed)","color":"#089981","alpha":0.18},{"t0":1793866500,"t1":1793872740,"hi":24579.9,"lo":24576.1,"text":"\u200bBSL 15m equal highs (Thu)","color":"#ff9800","alpha":0.35},{"t0":1793850300,"t1":1793872740,"hi":24404.07,"lo":24355.86,"text":"\u200bOTE 62-79% of Thu's leg (long side)","color":"#089981","alpha":0.1},{"t0":1793763900,"t1":1793872740,"hi":24296.3,"lo":23810.85,"text":"\u200bD bull FVG (4-Nov, unfilled part)","color":"#089981","alpha":0.08}],"daily_source":"Dhan daily","layout":"Lemonn Layout - Nifty 50"};
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