# Chart reviews

One Nifty session per page, read the way the Smart money course teaches: the map at 9:15, the pools, the sweeps, the gaps, and the candles that mattered. Each chart is drawn from that day's 1-minute index data by `tools/market-review.py`. The **numbered markers** match the numbered list in the review, and the **▲ ▼ markers** along the bottom are Chinmay Sir's own logged Nifty option entries (green win, red loss, grey other). The top chart uses 3-minute candles for the whole day; the two panels below zoom into the day's two most important moments on 1-minute candles.

These are studies of finished sessions, not calls for the next one. Everything in the "where the course's rules found trades" sections is hindsight, written to train your eye.

## Five sessions side by side

| Day | Gap | Type | First big pool | What it did | The day's best move started from |
|---|---|---|---|---|---|
| Fri 11 Sep | −207 | mixed, up | Opening-range high | Broke at 10:03 | The 13:41 sweep of the midday equal lows |
| Tue 15 Sep | +178 | trend down | Yesterday's high / OR low | "Swept" at 09:32 with no reversal | The failed gap: high in the first minute |
| Wed 16 Sep | +82 | range | Yesterday's low (gap fill) | Swept twice at 09:45–09:47, held | That sweep — the day's low |
| Thu 17 Sep | −22 | mixed | Yesterday's high | Broke 09:31, failed 09:42 | The 11:11 poke under yesterday's close |
| Fri 18 Sep | +64 | range | Opening-range low | Swept 09:32–09:35, held | That sweep — the day's low |

## What repeats across the five

- **The day's extreme often prints in the first 30 minutes** (11, 15, 16, 17 and 18 Sep all had one extreme before 09:50). Wait for the opening range before trusting a direction.
- **A sweep only counts with displacement.** 16 and 18 Sep: sweep plus strong reversal candle, and the level held all day. 15 Sep: the same shape without displacement, and the trend simply continued.
- **The first break of an obvious level is often the trap** (17 Sep at 09:42, 18 Sep at 15:02). A break that holds for the rest of the session is the exception.
- **Big gaps behave differently from small ones.** Both 170–200-point gaps (11 and 15 Sep) moved hard *against* the gap. The smaller gaps (16–18 Sep) produced ranges.
- **On a trend day, gaps in its direction stay open**, and sweeps against it fail (15 Sep).

## The setup scanner: more opportunities, scored honestly

A review that shows only the day's best move makes trading look like one or two perfect trades a day. The scanner shows everything the rules would have flagged. It applies four setups from the course to every minute from 09:30 to 14:45:

| Code | Setup | Rule | Entry | Stop |
|---|---|---|---|---|
| **S** | Sweep reversal | Price pokes 0.5–15 pts beyond a pool (yesterday's high/low/close, opening range, equal highs/lows, round number), closes back inside within 3 candles, and a reversal candle at least 2× the normal size follows within 5 | Close of that reversal candle | 1 pt beyond the sweep's extreme |
| **G** | Gap (FVG) pullback | The first return into a fair value gap left by an impulse candle, within an hour | The gap's near edge | 1 pt beyond the gap's far edge |
| **B** | Break + follow-up | A 1-minute close through a pool, then a next candle with a big body that closes further through, near its extreme | Follow-up candle's close | 1 pt beyond the breakout candle |
| **T** | Failed break (trap) | A break that closes back through the level within 30 minutes, with a reversal candle in the last 5 | That close | 1 pt beyond the break's extreme |

Every setup is then scored the same way: a **2R target**, the stop, or a **time exit after 45 minutes**, whichever comes first. A candle that touches both the stop and the target counts as the stop. Setups needing a stop tighter than 4 points or wider than 40 are skipped. Results are in **index points and R** (multiples of the risk), before costs and slippage — option premiums move less than the index, and differently.

```review-summary
```

### What the scanner teaches so far (5 sessions, 30 setups)
- **There are more opportunities than the highlights suggest** — about six a day — **but the edge per trade is thin**: +3.03R over 30 trades, about +0.10R each, before costs. Most of the money came from a handful of trades.
- **Gap pullbacks (G) are the most common setup (21 of 30)**, and they live or die by the day type: they paid on trend days (15 Sep) and trending afternoons, and were stopped repeatedly inside ranges (16 and 17 Sep).
- **Sweep reversals (S) were rarer but better** (5 signals, +2.22R). Breaks with follow-up (B) were fragile on these range-heavy days (4 signals, no 2R hits).
- **On a trend day, counter-trend setups fail.** Both longs on 15 Sep were stopped within two minutes; every short in the trend's direction either hit 2R or was ahead at the time exit.
- **The daily stop is a trade-off, not a free lunch.** Stopping after two consecutive losses cut 17 Sep from −5R to −2R, but it also stopped 11 and 15 Sep before their best trades: over these five days it turned +3.03R into −0.19R. Five days can't settle that — keep measuring.
- **The scanner is stricter than your eye.** On 16 and 17 Sep the day's best reversals weren't flagged, because no reversal candle was big enough. The rules protect you from the fake ones and cost you some real ones.

Everything here is hindsight on five sessions — a way to train your eye and to test rules, not evidence of an edge.
