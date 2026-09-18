# Level up — expert techniques that build on his method

These are **not from his streams**. They're standard scalping and option-buying techniques chosen because they sharpen the setups in the playbook. Each one says which setup it builds on, how to apply it, a precise **Test it** rule you can backtest or code into a bot, and a **Drill** for practice. Treat every idea as a hypothesis until your own journal or a backtest supports it. This is education, not financial advice.

## Sharpen the core setup

### Measure "tight" instead of eyeballing it
**Builds on:** [setup A, the follow-up candle breakout](knowledge/playbook.md) and the barcode pattern.
**Why it helps:** "small candles at one level" is his trigger for a coming blast, but "small" is subjective. A number makes it repeatable and removes the urge to force a breakout out of a normal range.
**How to apply:** on the 1-minute option chart, compare the height of the last 6–10 candles (highest high minus lowest low) with the typical 1-minute range (ATR 14). A true squeeze is well under the typical range.
**Test it:** consolidation = `max(high, 8) − min(low, 8) < 0.6 × ATR(14)` and at least 3 of those candles touch within 1% of the same high.
**Drill:** before each session, scroll back through yesterday's 1-minute option chart and mark every squeeze you'd count. Then check how many broke out within 10 candles.

### Grade the follow-up candle
**Builds on:** setup A.
**Why it helps:** the log's clearest finding is that the follow-up candle is the edge (the raw breakout lost every time). Not every follow-up is equal: a weak one that closes back near the level is closer to a raw breakout than a confirmation.
**How to apply:** only take the follow-up if it closes in the top third of its own range, its body is at least half its range, and it holds above the breakout candle's close.
**Test it:** `close > breakout_close` and `(close − low) / (high − low) ≥ 0.67` and `|close − open| ≥ 0.5 × (high − low)`.
**Drill:** in the Practice tab, before choosing an answer, say out loud whether the follow-up is strong, weak or missing.

### Use a time stop, not just a price stop
**Builds on:** setups A, B and H; his warning that "the option isn't following".
**Why it helps:** an option buyer pays time decay every minute. A breakout that's real usually moves within a few candles; one that stalls is quietly costing you even if the stop never hits. His 8-Sep loss stalled exactly like this.
**How to apply:** if price hasn't moved at least 0.5R in your favour within 3–5 one-minute candles, exit at or near cost instead of waiting for the stop.
**Test it:** `if bars_since_entry ≥ 5 and max_favourable_excursion < 0.5 × risk: exit at market`.
**Drill:** review your last 10 losing scalps and note how many were in profit or flat for several candles before failing.

### Confirm with the mirror option
**Builds on:** setup A and his side-by-side CE/PE layout.
**Why it helps:** a real call breakout usually shows up as the put breaking *down* at the same time. When only one side moves, it's often a spread or liquidity blip rather than genuine direction.
**How to apply:** before entering a CE breakout, check that the PE on the other panel has made a fresh low in the same 1–2 minutes (and the reverse for PE entries).
**Test it:** `CE breaks its consolidation high` and `PE prints a new 10-bar low within ±2 bars`.
**Drill:** on three past day notes, find each winning entry and look at the opposite option's panel in the frame.

### Know your best hours
**Builds on:** the time column in the trade log.
**Why it helps:** scalping edges are rarely spread evenly across the day. Opening momentum, midday chop and expiry afternoons behave very differently, and his box days show how expensive the wrong hours can be.
**How to apply:** check the "by hour" table at the top of this page. Trade your full size in the hours where the log is strongest and half size, or not at all, where it's weak.
**Test it:** group backtest trades by entry hour and require a positive expectancy per hour bucket before allowing entries in it.
**Drill:** each Friday, update the table in your own journal and write one sentence on what changed.

## Option-buyer mechanics

### Pick strikes by delta, not just premium
**Builds on:** his "₹150 premium, near the money" strike rule.
**Why it helps:** the ₹150 rule is really a proxy for delta. A near-the-money option has a delta around 0.5, so it moves roughly half a point per index point. Far-OTM strikes have tiny deltas, so the index can move your way while the option barely does.
**How to apply:** for scalps, prefer strikes with delta between about 0.45 and 0.65. Re-check after big moves, because yesterday's ATM strike may now be deep in or out of the money.
**Test it:** at entry, select the strike whose delta is closest to 0.55 from the option chain.
**Drill:** for one session, write down the option's move per 10 index points on two different strikes.

### Respect the theta clock
**Builds on:** his notes on premium decay into expiry and the jodi's "long flat bleed".
**Why it helps:** time decay is small early in the week and accelerates into expiry, sharpest in the final day. A trade that would be fine to hold on a Monday can bleed noticeably on expiry afternoon.
**How to apply:** on expiry day, shorten holding time, take partial profits sooner and avoid holding a stalled position through lunch.
**Test it:** compare backtest results for max holding times of 10, 20 and 40 minutes, split by days-to-expiry.
**Drill:** note the premium of an ATM option at 9:30, 12:30 and 15:00 on a flat expiry day and compare.

### Don't buy the IV spike before an event
**Builds on:** his IV scale (Nifty 12–13 normal, Sensex 18–20 normal, 27+ abnormal).
**Why it helps:** before RBI policy, budgets, big results or index events, implied volatility inflates option prices. After the event, IV often drops sharply ("IV crush"), so an option can lose value even if price moves your way.
**How to apply:** avoid fresh buys in the last 30 minutes before a scheduled event. Trade the breakout after the announcement, when IV has reset and direction is clear.
**Test it:** `if event_within_minutes(30) or india_vix_change_today > 8%: block new option buys`.
**Drill:** track India VIX and an ATM straddle's price across one scheduled event day.

### Measure spread and slippage
**Builds on:** his point that Sensex strikes are less liquid than Nifty.
**Why it helps:** on a 5–10 point scalp, a few points of bid-ask spread and slippage can be most of the edge. Illiquid strikes also make stop losses fill worse than planned.
**How to apply:** trade strikes where the spread is tight relative to your target. Use limit orders for entries, and check the depth before using a market stop.
**Test it:** `skip if (ask − bid) > 0.5% of premium or (ask − bid) > 0.1 × target_points`.
**Drill:** for a week, record your intended vs actual fill on every trade.

### Cut size on expiry-day gamma
**Builds on:** the jodi setup, gamma blasts, and his expiry-day examples.
**Why it helps:** close to expiry, near-the-money options react violently to small index moves (high gamma). The same setup produces bigger winners and faster, deeper losers.
**How to apply:** on expiry afternoons, halve size and move stops to breakeven faster, instead of widening stops to "give it room".
**Test it:** size multiplier = `0.5 if days_to_expiry == 0 and time > 13:00 else 1.0`.
**Drill:** compare the average loss of your expiry-afternoon trades with other trades in your journal.

## Risk and sizing like a professional

### Size every trade from your stop
**Builds on:** his rule to know the rupee loss before entering.
**Why it helps:** sizing from the stop means a wide-stop trade automatically uses fewer lots, so every loss costs about the same share of your account. It also stops "big stop, big size" disasters.
**How to apply:** pick a fixed risk per trade, often 0.5–1% of trading capital. Lots = risk in ₹ ÷ (stop distance in option points × lot size). Round down, and check the current lot size because exchanges change it.
**Test it:** `lots = floor(capital × 0.01 / (abs(entry − stop) × lot_size))`, and skip the trade if that is zero.
**Drill:** write the lot calculation next to every trade in your journal before placing it.

### Judge setups by expectancy, not win rate
**Builds on:** the scorecard, and his "one good trade a day" mindset.
**Why it helps:** win rate alone misleads. A 40% setup with big winners can beat a 70% setup with big losers. Expectancy is the average result per trade: `win% × average win − loss% × average loss`.
**How to apply:** use the expectancy table at the top of this page to rank his setups. Put more practice time on the ones with positive expectancy and a real sample size.
**Test it:** only allow a setup live once it shows positive expectancy over at least 30 backtested or paper trades.
**Drill:** recalculate the table by hand for one setup to make sure you understand every number.

### Think in R, not points
**Builds on:** his 1:2 minimum risk-reward rule.
**Why it helps:** "20 points" means very different things with a 5-point stop and a 25-point stop. Measuring results in R (multiples of the planned risk) makes trades comparable across strikes, indices and days.
**How to apply:** record every result as `(exit − entry) ÷ (entry − stop)`. A +2R winner on a small stop is better than a +20-point winner on a huge one.
**Test it:** store `risk_points` at entry and report every result as `pnl_points / risk_points`.
**Drill:** convert the last 10 rows of the trade log into R and see which setups look better or worse.

### Pre-decide your daily stop
**Builds on:** his 2–3 trades a day cap and "close the terminal after back-to-back stop losses".
**Why it helps:** most blow-up days aren't one bad trade but revenge trades after one. A hard daily limit, set before the open, turns a bad day into a small loss.
**How to apply:** stop for the day after 2 consecutive losses or when the day reaches −2R, whichever comes first. No exceptions for "one more good setup".
**Test it:** `if consecutive_losses ≥ 2 or day_R ≤ −2: disable entries until next session`.
**Drill:** write your daily limit on paper next to the screen before 9:15.

### Scale out with a plan
**Builds on:** his trailing ladder and part-booking.
**Why it helps:** booking half at 1R and trailing the rest locks in a win on most trades while still catching the occasional big move. Deciding the split in advance removes in-trade hesitation.
**How to apply:** book 50% at 1R, move the stop to breakeven, then trail the remainder under each new higher low (or lower high for puts).
**Test it:** backtest three exits on the same entries: all-out at 2R, 50% at 1R plus trail, and a pure trail. Compare expectancy and drawdown.
**Drill:** for one week, write the exact exit plan (levels and quantities) before each entry.

## Read the market better

### Add VWAP as a filter
**Builds on:** his note that volume-based tools (VWAP, volume) are the ones worth using.
**Why it helps:** VWAP is the day's volume-weighted average price. When price holds above it, buyers are in control on average. Breakouts in the direction of VWAP tend to have more fuel than those fighting it.
**How to apply:** take CE breakouts only when the index (and ideally the option) is above VWAP, and PE breakouts only below it.
**Test it:** `long CE only if index_close > session_vwap`, and `long PE only if index_close < session_vwap`.
**Drill:** mark VWAP on three past days and check which of his winning trades agreed with it.

### Trade the opening range, but with his follow-up rule
**Builds on:** setup A and his "don't trade the tight opening range after a big gap" rule.
**Why it helps:** the first 15 minutes set a high and low that many traders watch. A break of that range with a follow-up candle is setup A with a clear, pre-drawn level.
**How to apply:** mark the 9:15–9:30 high and low on the index and your two options. Wait for a break plus a follow-up candle; skip it if the range is unusually wide after a gap.
**Test it:** `level = high(09:15–09:30)`; entry on the first follow-up candle after a close above `level`, skipped if range > 1.5 × 20-day average opening range.
**Drill:** mark the opening range every morning for two weeks and log what happened on the first break.

### Build a map of magnet levels
**Builds on:** his round-number strikes, call writers and max-OI levels.
**Why it helps:** prices react at levels many participants watch: previous day high/low, round numbers, the day's open, and strikes with the heaviest open interest. Targets placed just before these levels fill more often.
**How to apply:** before the open, list these levels for the index. Put targets slightly before a magnet, and treat a clean break of one as a new breakout level.
**Test it:** `target = nearest_magnet_in_direction − 0.1 × ATR(14)`.
**Drill:** after each session, count how many intraday turns happened within a few points of a mapped level.

### Watch India VIX direction
**Builds on:** his IV regimes and gap-up IV cooling.
**Why it helps:** rising India VIX during a fall means fear is growing and option premiums are expanding, which helps buyers. Falling VIX during a grind means premiums are shrinking and buyers need a bigger move just to break even.
**How to apply:** favour option buying when VIX is flat or rising with the move. Be quicker to take profits when VIX is sliding.
**Test it:** add `india_vix_change_15m` as a feature in your backtest and compare setup results when it is positive vs negative.
**Drill:** note the VIX direction at the time of each trade in your journal for two weeks.

### Use relative strength between indices
**Builds on:** his Nifty vs Bank Nifty divergence concept.
**Why it helps:** when banks are holding up while Nifty makes a new low, the fall is weaker than it looks. Divergence warns you before a breakdown fails.
**How to apply:** before a PE breakout on Nifty, check that Bank Nifty has also made a fresh intraday low. If it hasn't, reduce size or wait.
**Test it:** `allow Nifty PE only if BankNifty low(5 bars) < BankNifty low(prior 30 bars)`.
**Drill:** overlay Nifty and Bank Nifty on the same 5-minute chart for a week and mark divergences.

## Train faster

### Replay days before you read the notes
**Builds on:** the Days tab and the Practice quiz.
**Why it helps:** reading what he did teaches you his decisions; predicting them first trains your own eye. Bar replay turns a day's chart into hundreds of practice decisions.
**How to apply:** open a 1-minute chart in bar-replay mode for one of the days in this study desk. Mark where you'd enter, stop and target, then read that day's notes and compare.
**Test it:** track your replay "calls" in a sheet and compare their outcomes with his logged trades.
**Drill:** one replay day per weekend, starting with the days that have the most trades.

### Journal with screenshots and tags
**Builds on:** his TRADE RECORDS sheet and the frame-verified trade log here.
**Why it helps:** numbers show *that* something went wrong; screenshots show *why*. Tagging each trade by setup and mistake type turns a journal into a feedback loop.
**How to apply:** for every trade, save a chart screenshot at entry and at exit, plus the setup name and one mistake tag (early entry, no follow-up, oversized, moved stop, revenge, none).
**Test it:** every month, count mistake tags and calculate how much each tag cost in R.
**Drill:** re-tag your last 20 trades using the setup names from the playbook.

### Earn size setup by setup
**Builds on:** the scorecard's per-setup records.
**Why it helps:** most traders scale up because they feel confident, not because the data says so. Earning size per setup keeps weak setups small while strong ones grow.
**How to apply:** trade each new setup at minimum size for 20 trades. Increase size only if your own results show positive expectancy and you followed the rules on at least 80% of trades.
**Test it:** `size_level[setup] += 1 only if n ≥ 20 and expectancy_R > 0 and rule_adherence ≥ 0.8`.
**Drill:** write down your current size level for each setup you trade.

### Turn setups into code before trusting them
**Builds on:** your trading bot projects.
**Why it helps:** writing a setup as code exposes every vague word in it ("tight", "strong", "near"). A backtest then shows whether the edge survives costs and slippage.
**How to apply:** start with setup A. Define the consolidation, breakout candle, follow-up candle, stop, target and time stop precisely (the Test it rules above are a starting point). Backtest on historical 1-minute option data, then paper trade before going live.
**Test it:** require the backtest to stay profitable after adding realistic costs and at least one tick of slippage per side.
**Drill:** write setup A as pseudocode in ten lines or fewer.

## Traps to avoid

### Count every cost on small scalps
**Builds on:** his 5–10 point scalps and "points before costs" in the scorecard.
**Why it helps:** every round trip pays brokerage, exchange fees, STT on the sell side, GST and stamp duty. On one lot and a 5-point target, these can take a meaningful share of the profit, and frequent scalping multiplies them.
**How to apply:** use your broker's charges calculator on a typical trade and convert the cost into option points. Set a minimum target of several times that cost.
**Test it:** subtract the round-trip cost in points from every backtest trade before calculating expectancy.
**Drill:** calculate the break-even move in points for one lot of your usual strike.

### Don't let hero-zero trades creep in
**Builds on:** his hero-zero explanation (he says he doesn't trade it).
**Why it helps:** cheap far-OTM options on expiry day win rarely. The occasional huge winner is memorable, but most expire worthless, so the average outcome is usually negative.
**How to apply:** if you want a lottery ticket, cap it at a tiny, fixed amount per month and track it separately from your real strategy.
**Test it:** keep hero-zero trades in their own journal tag and compute their expectancy after 30 attempts.
**Drill:** look at the last few expiry days and check what share of far-OTM options expired near zero.

### Verify before you copy
**Builds on:** the channel's Telegram calls and self-reported chat P&L.
**Why it helps:** many of the "wins" people post are unverified, and several of the host's own numbers were overstated when checked against frames here. Copying calls also skips the part where you learn the setup.
**How to apply:** treat outside calls as practice material. Only trade a call if it matches a setup you understand and it passes your own size and risk rules.
**Test it:** paper-trade any signal source for 30 calls and compare its real, frame-verified results with what was claimed.
**Drill:** pick one claimed big win and try to verify it from the chart.

### Remember the base rate
**Builds on:** everything above.
**Why it helps:** SEBI's own studies of the equity F&O segment (2023 and 2024) found that roughly 9 in 10 individual traders lost money. Having a method is necessary but not sufficient: risk control and cost awareness decide whether you're in the minority.
**How to apply:** start with capital you can afford to lose, keep risk per trade small, and judge yourself on following rules for months before judging profits.
**Test it:** track your monthly result in R and your rule adherence side by side for six months.
**Drill:** write down, before you start, the maximum you're willing to lose while learning.
