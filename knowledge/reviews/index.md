# Chart reviews

One Nifty session per page, read the way the Smart money course teaches: the map at 9:15, the pools, the sweeps, the gaps, and the candles that mattered. Each chart is drawn from that day's 1-minute index data by `tools/market-review.py` — from Dhan's official intraday feed from 21 Sep onwards (the 11–18 Sep reviews used Yahoo's public feed, which differs by a few points). The **numbered markers** match the numbered list in the review, and the **▲ ▼ markers** along the bottom are Chinmay Sir's own logged Nifty option entries (green win, red loss, grey other). The top chart uses 3-minute candles for the whole day; the two panels below zoom into the day's two most important moments on 1-minute candles.

These are studies of finished sessions, not calls for the next one. Everything in the "where the course's rules found trades" sections is hindsight, written to train your eye.

## Sessions side by side

| Day | Gap | Type | First big pool | What it did | The day's best move started from |
|---|---|---|---|---|---|
| Fri 11 Sep | −207 | mixed, up | Opening-range high | Broke at 10:03 | The 13:41 sweep of the midday equal lows |
| Tue 15 Sep | +178 | trend down | Yesterday's high / OR low | "Swept" at 09:32 with no reversal | The failed gap: high in the first minute |
| Wed 16 Sep | +82 | range | Yesterday's low (gap fill) | Swept twice at 09:45–09:47, held | That sweep — the day's low |
| Thu 17 Sep | −22 | mixed | Yesterday's high | Broke 09:31, failed 09:42 | The 11:11 poke under yesterday's close |
| Fri 18 Sep | +64 | range | Opening-range low | Swept 09:32–09:35, held | That sweep — the day's low |
| Mon 21 Sep | −16 | mixed, up | Yesterday's high | Swept 09:18, held | The 09:15 candle — the low was in at once |
| Tue 22 Sep | +25 | trend down | Previous-day high | "Swept" at 09:15, no reversal | The 10:31 opening-range-low break |
| Wed 23 Sep | +23 | trend up | Opening-range low | Poked 2.2 pts at 09:54, no reversal candle, held | That poke — the day's low; confirmed by the 10:45 opening-range-high break |

## What repeats across them

- **The day's extreme often prints in the first 30 minutes** (11, 15, 16, 17, 18, 22 and 23 Sep all had one extreme before 09:55). Wait for the opening range before trusting a direction.
- **A sweep only counts with displacement.** 16 and 18 Sep: sweep plus strong reversal candle, and the level held all day. 15 and 22 Sep: the same shape without displacement, and the trend simply continued the other way.
- **The first break of an obvious level is often the trap** (17 Sep at 09:42, 18 Sep at 15:02) — but not always: 22 Sep's break of the previous-day low at 13:53 ran another 31 points before its own late reversal at 14:14, a reminder the "first break is a trap" pattern isn't universal.
- **Big gaps behave differently from small ones.** Both 170–200-point gaps (11 and 15 Sep) moved hard *against* the gap. The smaller gaps (16–18 and 22 Sep) produced ranges or trend days that still respected nearby levels.
- **On a trend day, gaps in its direction stay open**, and sweeps against it fail (15 and 22 Sep both swept a level at the open with zero follow-through, then trended the other way all session).
- **Even a clean trend day can reverse hard in one candle** (22 Sep, 14:14: a 4.5×-normal candle erased hours of a downtrend). No rule-based setup in the scanner catches this — it's a risk-management lesson, not an entry.

## The setup scanner: more opportunities, scored honestly

A review that shows only the day's best move makes trading look like one or two perfect trades a day. The scanner shows everything the rules would have flagged. It applies four setups from the course to every minute from 09:30 to 14:45:

| Code | Setup | Rule | Entry | Stop |
|---|---|---|---|---|
| **S** | Sweep reversal | Price pokes 0.5–15 pts beyond a pool (yesterday's high/low/close, opening range, equal highs/lows, round number), closes back inside within 3 candles, and a reversal candle at least 2× the normal size follows within 5 | Close of that reversal candle | 1 pt beyond the sweep's extreme |
| **G** | Gap (FVG) pullback | A pullback that fills a displacement gap **to its far edge**, then a candle closing in the trade direction at the zone | When price takes out that candle's extreme | 1 pt beyond that candle's other side |
| ~~**B**~~ | ~~Break + follow-up~~ | **Retired 21 Sep** — 28 setups, −15.3R, 4% reached 2R. See below. | — | — |
| **T** | Failed break (trap) | A break that closes back through the level within 30 minutes, with a reversal candle in the last 5 | That close | 1 pt beyond the break's extreme |

Every setup is then scored the same way: a **2R target**, the stop, or a **time exit after 45 minutes**, whichever comes first. A candle that touches both the stop and the target counts as the stop. Setups needing a stop tighter than 4 points or wider than 40 are skipped. Results are in **index points and R** (multiples of the risk), before costs and slippage — option premiums move less than the index, and differently.

```review-summary
```

### What the scanner teaches so far (41 sessions, 135 setups)

The rules were rebuilt on 21 Sep after a 41-session test showed they lost money. The old set ran **−38.6R over 186
setups** (−0.21R each). Two changes fixed the bleeding, and both came from his own playbook rather than from tuning:

| Rule | Setups | Total | Per trade | Hit 2R |
|---|---|---|---|---|
| **G** Gap pullback *(rewritten)* | 89 | **+18.8R** | **+0.21R** | 36% |
| **S** Sweep reversal | 44 | −1.9R | −0.04R | 16% |
| **T** Failed break | 2 | −1.6R | −0.79R | 0% |
| **All** | 135 | **+15.3R** | **+0.11R** | |

**1. G now waits, the way he waits.** It used to buy the gap's near edge the moment price touched it — 135 setups,
−29.6R, 71% stopped, and a median best excursion of only 0.63R: it was entering trades that never went anywhere.
It now requires the **deep fill to the gap's far edge**, then a **candle closing in the trade direction at the zone**,
and enters only when price takes out that candle's extreme — his pullback rule (playbook B, 14W/0L). Median best
excursion doubled to 1.28R.

**2. B was retired, not fixed.** Break + follow-up ran −15.3R over 28 setups with 4% reaching 2R. It entered at the
*close* of the follow-up candle, two candles into the move, paying a wide stop for a move already spent. Rewriting it
his way — a named trigger above a consolidation, the setup he wins 90% of — was tested and abandoned: a tight-base
definition produced either 3 setups or 400–900 a month of noise, and a "must be at a level" filter swung from −0.02R
to +0.08R per trade on a small threshold change. That is curve-fitting. **He wins that setup because he chooses which
base matters, and that judgement isn't mechanical.**

**+0.11R per trade is not an edge.** It is a system that has stopped losing, in index points, before costs. On weekly
options with spread and theta it would still struggle. What survives from the earlier work:

- **Tight stops raise the loss rate.** Risk of 4–8 points: −0.40R per trade. Risk of 25–40 points: −0.06R. Keep risk
  small with **position size** (lesson 5.6), not by squeezing the stop.
- **A level on its own is not an edge.** Across 40 sessions, 240 touches of known levels scored a 0.73 rejection share
  against a random control's **0.74**, and *broke* more often (50% held versus 64%). Only round numbers (0.79) and
  levels price had already visited five or more times (0.78) beat the control.
- **The rules agreeing with him is the strongest signal we have measured.** On the 21 sessions where both traded Nifty,
  the setups he independently took made **+0.62R each** and he won **80%** of them; the setups he ignored made −0.08R.
  A setup the rules find on their own is a place to look, not a trade.
- **Obvious filters need testing.** Restricting the rewritten G to the day's prevailing direction made it *worse*
  (−0.17R versus +0.03R), and a 3R target beat a 1R target on the old rules but lost to it on the new ones.
- **The scanner is stricter than your eye.** On 16 and 17 Sep the day's best reversals weren't flagged, because no reversal candle was big enough. The rules protect you from the fake ones and cost you some real ones.

Everything here is hindsight on five sessions — a way to train your eye and to test rules, not evidence of an edge.
