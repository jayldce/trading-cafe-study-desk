# Levels & zones

Every level he draws marks a place where **price already reacted**: buyers or sellers stepped in, or stop losses are waiting. There are no formulas behind them. When a viewer asked how his boxes and levels are made, he said they're acceptance levels, support and resistance, trap levels and fair value gaps, and that he'd explain them gradually [▶ 22 Jul](https://www.youtube.com/watch?v=jCedaeF9RWg&t=10980s). He never gave a full recipe on stream, so the first half of this guide combines that answer with what his charts show day after day.

The second half is different: **other well-known ways traders find levels**, and **which default chart indicators help**. Those parts are *not* from his streams. They're from published references, listed under Sources at the end.

He marks levels on **two layers**: the index before the open, for context and targets, and each option chart live, for entries and stops.

## Layer 1: the index, before the open

On a higher timeframe (daily or 15-minute) of Nifty or Sensex he marks:

1. **Tested zones.** Areas where price turned several times. More reactions make a stronger zone. On 11 Sep the daily zone at 23,660–23,675 had broken, so he marked the next support near 23,020 and said about 200 points were "on the table" [▶ 11 Sep](https://www.youtube.com/watch?v=qTDwaNEZ2RY&t=540s) `data/frames/qTDwaNEZ2RY/000900.jpg`
2. **Where yesterday's big move started.** The origin of a sharp fall is **supply**; the origin of a sharp rally is **demand**. On 30 Jul he marked the previous day's supply zone and expected the day's move to launch from it [▶ 30 Jul](https://www.youtube.com/watch?v=5uyR5XEbx4M&t=60s)
3. **Round numbers and heavily written strikes.** Levels like 24,000 or 23,300, where call and put writers defend positions. On 4 Aug Nifty stuck to 24,600 for hours because both sides were defending it [▶ 4 Aug](https://www.youtube.com/watch?v=zmnPW3HauhM&t=1440s)
4. **The day's make-or-break level.** On 28 Jul: 24,000 make-or-break, 23,800 support, 24,130 selling zone [▶ 28 Jul](https://www.youtube.com/watch?v=nlcPnRhXJDs&t=420s)

These don't trigger trades. They tell him how far a move can run and where targets belong.

## Layer 2: the option chart, live

After choosing his ~₹150 call and put, he draws boxes on each **1-minute option chart**:

| Zone | How to spot it | What he uses it for |
|---|---|---|
| **Base** | The cluster of candles the option launched from | Stop goes below it; pullback entries come back to it |
| **Barrier (make-or-break)** | The same high rejected 2–3 times | The breakout level for his core follow-up setup |
| **Barcode range** | Many tiny, similar candles at one level | No trades inside; trade the break with a follow-up candle |
| **Day high / low** | The obvious extremes | Trigger levels; stops go beyond them |
| **Demand / supply** | Where it last launched from (demand) or where lower lows formed (supply) | Reversal entries |
| **Trap levels** | Just beyond obvious highs or lows, where stops cluster | Watch for a sweep, then a reversal |
| **Fair value gap** | A stretch price crossed too fast | Price often returns to it; late traders get trapped |

Examples: the base and barrier boxes on the 11 Sep call `data/frames/qTDwaNEZ2RY/002330.jpg` and the demand box on the 8 Sep put `data/frames/s3r5EJy4cw8/010900.jpg`.

He draws these **separately on every option**. That's one reason he rarely changes strikes: a new strike means redrawing everything [▶ 22 Jul](https://www.youtube.com/watch?v=jCedaeF9RWg&t=9420s).

## Connecting the two layers

He translates index levels into option prices. On 11 Sep, Nifty breaking its 23,269–23,276 base toward the 23,300 round number put the 23150 call's target near 210, and the option touched 210 almost exactly [▶ 11 Sep](https://www.youtube.com/watch?v=qTDwaNEZ2RY&t=4800s).

```
option price
  210 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  target  (= Nifty 23,300 round number)
                                  ┃
  178 ══════════╤══╤══╤════════ ┃ ═  barrier (rejected 3 times)
         ▯ ▯▮ ▯▯ ▮ ▯ ▯▮ ▯   ┃▮┃      barcode, then breakout + follow-up candle
  170 ════════════════════════════  base  (stop loss goes below)
```

## Is the zone still good?

- **Count the touches.** After two bounces a zone weakens, and a third test rarely holds. His word for a bounce is *tappa*: the first bounces best [▶ 8 Sep](https://www.youtube.com/watch?v=s3r5EJy4cw8&t=6660s)
- **Judge the bounce.** A weak bounce off a broken level usually means a breakdown from that same zone [▶ 11 Sep](https://www.youtube.com/watch?v=qTDwaNEZ2RY&t=7380s)
- **Resistance isn't liquidity.** A zone where price merely stalls is resistance. A zone with lots of stop losses behind it is liquidity, and only that kind gets swept [▶ 25 Aug](https://www.youtube.com/watch?v=hkQBf4EvCuo&t=12540s)
- **Broken levels flip.** An old barrier becomes the pullback zone, which is his pullback setup (11 wins and 0 losses in the log).

## Your routine

1. **Before 9:15:** on the index daily and 15-minute charts, mark 2–3 tested zones, yesterday's supply or demand, and the nearest round number.
2. **After the open:** pick your ~₹150 call and put, then let 5–15 minutes of candles form.
3. **On each option chart:** box the base, the day high and low, and any level rejected twice or more.
4. **Targets:** the next option zone that lines up with an index level.
5. **Stops:** below the base, or below the breakout or pin-bar candle.
6. **Redraw** whenever you change strikes.

## Other well-known ways to find levels

These methods are **not from his streams**. They're widely used by Indian intraday traders and are worth knowing, mainly as **confluence**: a level found by two different methods is more trustworthy than either alone. The first three are *reaction* levels like his; the rest are *calculated* from yesterday's prices, so treat them as places to watch, not reasons to trade.

### Reaction-based (closest to his method)
- **Previous day and week high, low and close.** Yesterday's extremes are where many stop losses and breakout orders sit, the same "trap level" idea he uses. A gap open beyond one of them is worth noting.
- **Opening range.** The high and low of the first 15 minutes. Many traders watch its break; pair it with his follow-up candle rule rather than buying the first poke.
- **Unfilled gap edges.** When the index gaps up or down, the previous close and the new open often act as support or resistance until the gap fills.
- **Option chain open interest.** The strikes with the highest call open interest often cap rallies, and the highest put open interest often supports dips. Read the *change* in open interest, not the snapshot: he notes hedged selling has made raw PCR less reliable for scalping [▶ 29 Jul](https://www.youtube.com/watch?v=aWD9ZCXlChk&t=15840s).

### Volume-based
- **Volume profile: point of control and value area.** A volume profile shows how much traded at each price. The **point of control (POC)** is the single highest-volume price and tends to act like a magnet. The **value area** is where about 70% of volume traded; its top (**VAH**) and bottom (**VAL**) often act as resistance and support. High-volume areas are acceptance zones, while thin, low-volume areas are where price tends to move fast, similar in spirit to his fair value gaps.
- **Anchored VWAP from an event.** A VWAP started from the day's low, high or a news candle shows the average price paid since that moment. Price reclaiming or losing it is a useful line in the sand.

### Calculated from yesterday's prices
- **Central Pivot Range (CPR).** Very popular for Nifty intraday. From yesterday's high (H), low (L) and close (C): pivot `P = (H + L + C) / 3`, bottom central `BC = (H + L) / 2`, top central `TC = (P − BC) + P`. Price holding above the range reads as strength, below it as weakness, and inside it as consolidation. A **narrow CPR** often comes before a trending day; a **wide CPR** before a range-bound one.
- **Classic and Camarilla pivots.** Support and resistance levels (S1–S3 and R1–R3, or Camarilla's H3/H4 and L3/L4) projected from yesterday's range. Camarilla levels sit closer to price and are often used for intraday reversals at H3/L3 and breakouts through H4/L4.

**How to combine them with his method:** mark his reaction zones first. Then check whether a CPR edge, a previous day high or low, a value-area edge or a big open-interest strike sits in the same area. When two agree, give that zone more weight for targets and stops. When a calculated level has no reaction behind it, don't trade it on its own.

## Default chart indicators that help

His stance matters here: he ignores price-based indicators like RSI and moving averages, and only uses volume-based tools such as VWAP and volume for confirmation [▶ 3 Sep](https://www.youtube.com/watch?v=vK9x0XEwaAg&t=6960s). So use indicators to **find and check levels faster**, never to make the decision. The candles still decide.

The indicators below are TradingView built-ins. His broker's chart (tv.lemonn.in) is TradingView-powered, and Lemonn advertises 100+ TradingView indicators on it, so most of these should be there, but check your own chart because a broker's version may not include everything. Settings are starting points for a 1-minute option chart.

| Zone you want | Built-in indicator | Settings to try | How it helps | Watch out |
|---|---|---|---|---|
| Tested highs and lows (barrier, base) | **Pivot Points High Low** | Left and right bars 5–10 (raise toward 20 for only major swings) | Labels swing highs and lows automatically; several labels at the same price mark a barrier or base | A pivot is confirmed only after the right-bars count, so it lags |
| Swing structure, higher highs | **Zig Zag** | Start from the defaults; raise Depth to ignore small swings | Connects swing highs and lows so higher highs and lower lows stand out | The last leg can change until the swing completes |
| Range edges, breakout level | **Donchian Channels** | Length 20 | Upper and lower bands are the recent high and low, a quick outline of the range | Bands move every candle, so they aren't fixed zones |
| Squeeze / barcode | **Bollinger BandWidth** (or Bollinger Bands) | 20, 2 | Very low bandwidth flags "the squeeze", the quiet period before a volatility burst | Tells you *when* energy is building, not the direction |
| "Is it really tight?" | **Average True Range** | 14 | Compare the range's height with ATR (see "Measure tight" in Level up) | Needs a rule you've written down |
| Day's fair price | **VWAP** (session), plus the **Anchored VWAP** drawing tool | Session anchor; anchor the tool at the day's low or high | Price above VWAP means buyers are in control on average; a good breakout filter. Anchored VWAP is free on TradingView | Not a level to fade blindly |
| Index pivots, CPR-style levels | **Pivot Points Standard** | Type Traditional, Classic or **Camarilla**; daily timeframe | Pre-computed support and resistance from yesterday's high, low and close | Formula levels, not reaction levels; confluence only |
| Acceptance zones, POC, value area | **Visible Range Volume Profile**, or the **Fixed Range Volume Profile** drawing tool | Value area 70% | Shows POC, VAH and VAL directly | **Needs a paid TradingView plan** (Essential or higher; Anchored Volume Profile needs Plus or higher) and may not be on a broker's chart; option volume is thin on far strikes |
| Breakout strength | **Volume** | Add a 20-period average | A breakout candle on above-average volume has more fuel | Option volume can spike for unrelated reasons |

**No built-in exists for these, so mark them yourself:**
- **Previous day high and low:** TradingView has no built-in for this. Draw horizontal lines from yesterday's daily candle, or use a community script only after checking how it defines the trading day.
- **CPR:** not a built-in either. Calculate it with the formula above, or use a reviewed community script.
- **Fair value gap:** mark it by eye. A bullish gap exists when candle 1's high is below candle 3's low; a bearish gap when candle 1's low is above candle 3's high.
- **Order block:** the last opposite-coloured candle before a strong move. Box that candle's range.
- **Option-writer levels:** these come from the option chain (open interest change by strike), not a chart indicator. Use your broker's option chain or the NSE website.

### A lean layout

- **Index (5-minute):** Pivot Points Standard (daily, Traditional or Camarilla) and VWAP, plus your hand-drawn tested zones, previous day high and low, and CPR if you use it.
- **Each option (1-minute):** Pivot Points High Low (5/5), Volume with a 20 average, VWAP, and Bollinger BandWidth in a lower pane.

Keep everything else off. If the chart is crowded, you'll stop seeing the candles he actually trades from.

## Sources

His method comes from the processed streams linked throughout. The other methods and indicator details come from:

- TradingView Help Center: [Pivot Points High Low](https://www.tradingview.com/support/solutions/43000589195-pivot-points-high-low/), [Pivot Points Standard](https://www.tradingview.com/support/solutions/43000521824-pivot-points-standard/), [Donchian Channels](https://www.tradingview.com/support/solutions/43000502253-donchian-channels-dc/), [Bollinger BandWidth](https://www.tradingview.com/support/solutions/43000501972-bollinger-bandwidth-bbw/), [Anchored VWAP drawing tool](https://www.tradingview.com/support/solutions/43000669764-anchored-vwap-drawing-tool/), [Volume profile basic concepts](https://www.tradingview.com/support/solutions/43000502040-volume-profile-indicators-basic-concepts/), [Visible Range Volume Profile](https://www.tradingview.com/support/solutions/43000703076-visible-range-volume-profile/), [Fixed Range Volume Profile tool](https://www.tradingview.com/support/solutions/43000707985-fixed-range-volume-profile-drawing-tool/)
- Volume profile plan requirements: [Financial Tech Wiz](https://www.financialtechwiz.com/post/tradingview-volume-profile/) and [InnovateHub Finance](https://innovatehubfinance.com/tradingview-volume-profile/)
- Volume profile levels: [Charles Schwab](https://www.schwab.com/learn/story/using-volume-profile-indicator) and [OANDA](https://www.oanda.com/us-en/trade-tap-blog/trading-knowledge/volume-profile-explained/)
- Central Pivot Range: [Groww](https://groww.in/blog/central-pivot-range), [Bajaj Broking](https://www.bajajbroking.in/blog/central-pivot-range-in-trading) and [Choice](https://choiceindia.com/blog/central-pivot-range)
- Pivot point types: [Tradejini](https://www.tradejini.com/blogs/types-of-pivot-points-used-for-trading)
- His broker's charts: [TradingView with Lemonn](https://lemonn.co.in/tradingview) and [Lemonn Web Terminal guide](https://lemonn.co.in/blog/product-update/lemonn-web-terminal-guide/)
- No built-in previous-day high/low: TradingView's [community scripts for previous day high and low](https://in.tradingview.com/scripts/previousdayhighandlow/)
