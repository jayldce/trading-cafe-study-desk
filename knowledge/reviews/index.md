# Chart reviews

One Nifty session per page, read the way the Smart money course teaches: the map at 9:15, the pools, the sweeps, the gaps, and the candles that mattered. Each chart is drawn from that day's 1-minute index data by `tools/market-review.py` — from Dhan's official intraday feed from 21 Sep onwards (the 11–18 Sep reviews used Yahoo's public feed, which differs by a few points). The **numbered markers** match the numbered list in the review, and the **▲ ▼ markers** along the bottom are Chinmay Sir's own logged Nifty option entries (green win, red loss, grey other). The top chart uses 3-minute candles for the whole day; the two panels below zoom into the day's two most important moments on 1-minute candles.

These are studies of finished sessions, not calls for the next one. Everything in the "where the course's rules found trades" sections is hindsight, written to train your eye.

## Five sessions side by side

| Day | Gap | Type | First big pool | What it did | The day's best move started from |
|---|---|---|---|---|---|
| Fri 11 Sep | −207 | mixed, up | Opening-range high | Broke at 10:03 | The 13:41 sweep of the midday equal lows |
| Tue 15 Sep | +178 | trend down | Yesterday's high / OR low | "Swept" at 09:32 with no reversal | The failed gap: high in the first minute |
| Wed 16 Sep | +82 | range | Yesterday's low (gap fill) | Swept twice at 09:45–09:47, held | That sweep — the day's low |
| Thu 17 Sep | −22 | mixed | Yesterday's high | Broke 09:31, failed 09:42 | The 11:11 poke under yesterday's close |
| Fri 18 Sep | +64 | range | Opening-range low | Swept 09:32–09:35, held | That sweep — the day's low |
| Mon 21 Sep | −16 | mixed, up | Yesterday's high | Swept 09:18, held | The 09:15 candle — the low was in at once |

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

### What the scanner teaches so far (40 sessions, 186 setups)

**The honest headline: this rule set loses money.** Over 40 cached sessions (24 Jul – 18 Sep) it produced 186 setups
worth **−38.6R**, about **−0.21R per trade**, in index points before costs. An earlier version of this section reported
+3.03R over 30 trades — that was the five days written up below, and it did not survive a larger sample. Two of the
conclusions drawn from those five days flipped outright; they are corrected here.

| Rule | Setups | Total | Per trade | Stopped | Median best excursion |
|---|---|---|---|---|---|
| **S** Sweep reversal | 42 | −0.5R | −0.01R | 45% | 0.81R |
| **G** Gap (FVG) pullback | 112 | **−25.2R** | −0.23R | 71% | 0.60R |
| **B** Break + follow-up | 30 | −11.3R | −0.38R | 67% | 1.01R |
| **All** | 186 | −38.6R | −0.21R | | 0.72R |

- **Gap pullbacks are the bleeding wound.** They fire most often (112 of 186) and **46% never move even 0.5R in your
  favour**. Entering at a gap's near edge with a stop at its far edge is a coin flip inside noise.
- **Corrected — "3R is the best target" does not hold.** Across 186 setups: 1R −0.13R per trade, 2R −0.22R, 3R −0.21R.
  Median best excursion is **0.72R**: these entries simply don't travel far enough relative to their stop. The
  +8.03R-at-3R result came from five days.
- **Corrected — a wider stop doesn't rescue it either** (−0.21R per trade at 1.5× risk). The entries are the problem,
  not the exits.
- **Still true: tight stops raise the loss rate.** Risk of 4–8 points: −0.40R per trade. Risk of 25–40 points: −0.06R.
  Keep risk small with **position size** (lesson 5.6), not by squeezing the stop.
- **Still true: on a trend day, counter-trend setups fail.** This is where the losses concentrate. 21 Sep is the clearest
  case: the one losing signal shorted a level price had already been accepted above for an hour.
- **Sweep reversals are the only rule that isn't losing** (−0.01R per trade), and they are the closest to the method
  Chinmay Sir actually trades: wait for the sweep, wait for the reversal candle, then act.
- **A level on its own is not an edge.** A separate study of 40 sessions measured how price reacts at 240 known levels
  against 503 random prices in the same sessions: the levels scored a 0.73 rejection share against the random control's
  **0.74**, and *broke more often* (50% held versus 64%). Only round numbers (0.79) and levels price had visited five or
  more times (0.78) beat the control. Levels are context for where to look — the confirmation is what matters.
- **The scanner is stricter than your eye.** On 16 and 17 Sep the day's best reversals weren't flagged, because no reversal candle was big enough. The rules protect you from the fake ones and cost you some real ones.

Everything here is hindsight on five sessions — a way to train your eye and to test rules, not evidence of an edge.
