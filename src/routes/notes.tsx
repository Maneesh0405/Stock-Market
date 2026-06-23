import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Course Notes · Edgewise" },
      { name: "description", content: "ICT Phase 4 trading course notes — Lectures 1–15." },
    ],
  }),
  component: NotesPage,
});

type Lecture = { n: number; title: string; body: string };

const lectures: Lecture[] = [
  {
    n: 1,
    title: "Elements To A Trade Setup",
    body: `Trading is not about following a fixed strategy or formula. It is a thought process. You need to remove fear, greed, and blind dependency on others. Every trade must have a reason.

The entire market has only 4 phases:

1. Consolidation — This is where every move begins. Price moves sideways in a range. Big players trap retail traders here, collect their stop losses, and execute their large orders quietly. Retail traders get lured into fake setups during this phase.

2. Expansion — After consolidation, price gets strong momentum and moves in one direction. During this move, POIs (Points of Interest) and imbalances are created. These MUST be filled later.

3. Retracement — Price pulls back after expansion to tap the POIs and imbalances created. Big players intentionally bring price back here to collect pending orders and refuel.

4. Reversal — A real reversal only happens when price grabs major swing high/low liquidity OR taps a major Higher Timeframe (HTF) POI. Lower timeframe POIs only cause temporary moves, not real reversals.

POI types to look for: Order Block, Mitigation Block, Rejection Block, Breaker Block, FVG (Fair Value Gap), Volume Imbalance, Gap Imbalance, Stop Runs, Key Level Highs/Lows, Equilibrium.

In an uptrend: price comes to discount zone → taps POI → moves up. Repeats.
In a downtrend: price enters premium zone → taps POI → moves down. Repeats.`,
  },
  {
    n: 2,
    title: "Time + Profile + Key Level",
    body: `Time is the base for everything in trading. The same market looks completely different on different timeframes.

How much past data to mark per timeframe:
- Daily chart → past 9–12 months
- 4-hour chart → past 3 months
- 1-hour chart → past 3 weeks
- 15-minute chart → past 3–4 days

What to mark on each timeframe:
- Quick momentum origin levels (where price showed a big fast move)
- Fresh swing highs and swing lows (not yet tapped or broken)
- Clean highs and clean lows (equal highs/lows)
- Weekly high and low — note WHICH DAY and WHICH SESSION (killzone) made them
- Previous day high and low — note which session made them

Key level rule: A swing high or swing low is only valid if it has NOT been broken or retested. Once liquidity is grabbed from it, that level is worth nothing. Remove it from your chart.

Killzone = Session. The three sessions are: Asian, London, New York. Knowing which session made the weekly high or low gives you critical context about how the week was structured.`,
  },
  {
    n: 3,
    title: "Timeframe Importance + Premium & Discount Zone",
    body: `Timeframes are fractal — boxes inside boxes:
- 1 Monthly candle = 4–5 weekly candles
- 1 Weekly candle = 5 daily candles
- 1 Daily candle = 23 hourly candles

Which timeframe to start from depends on your trading style:
- Positional trading (1–2 years): Start from Monthly
- Swing trading: Start from Weekly
- Short-term trading: Start from Daily (confirm with Weekly + Monthly)
- Intraday trading: Daily + 4hr + 1hr + 15min

Premium and Discount Zones:
Apply the premium/discount tool to any swing (from low to high or high to low).
- 50% = Equilibrium (price consolidates here before next expansion)
- Above 50% = Premium zone → SELL from here
- Below 50% = Discount zone → BUY from here

Golden rule: Always buy from discount. Always sell from premium. No exceptions.

Why pullbacks happen: Price needs liquidity (fuel) to continue. It makes opposite moves to tap untapped POIs and refuel before continuing toward its HTF target.

3-candle swing rule: In a running market, wait for a 3-candle swing formation + 4th candle expansion before confirming a swing high or low.`,
  },
  {
    n: 4,
    title: "Liquidity Run",
    body: `What is liquidity? All buy orders, sell orders, and stop losses in the market. Big players need your orders on the other side to execute their massive trades. They cannot trade without liquidity. So price moves specifically to HUNT and collect these orders.

Low Resistance Liquidity (LRL):
No opposite POIs exist on the path. Price moves explosively and rapidly in one direction with no hurdles.
- In uptrend: each swing HIGH has Low Resistance → will be broken easily
- In downtrend: each swing LOW has Low Resistance → will be broken easily

High Resistance Liquidity (HRL):
Opposite POIs exist on the path. Price slows down, creates temporary reversals, and takes more time to reach the destination.
- In uptrend: each swing LOW has High Resistance → protects buyers' stops
- In downtrend: each swing HIGH has High Resistance → protects sellers' stops

The Main Swing (Anchor Point): The swing where big players protect their core orders. Retail traders cannot break this easily. Only high-impact news (FOMC, CPI, NFP) can break through it — and big players close their profits BEFORE the news hits.

If you're continuously hitting stop losses: You are in the WRONG direction relative to big players. Flip your bias immediately.`,
  },
  {
    n: 5,
    title: "Institutional Order Flow (IOF)",
    body: `Institutional investors = hedge funds, banks, insurance companies, mutual funds. They are like an elephant jumping in a pool — their trades move the entire market. They determine long-term direction (6 months, 1 year, 2 years).

Bullish IOF Candle (in uptrend):
Find the LAST BEARISH (selling) candle in the LEFT leg of the swing. This is the IOF candle. When price eventually pulls back down, it taps the UPPER WICK of this candle and reverses back up. Look ONLY in the left leg — never in the right.

Bearish IOF Candle (in downtrend):
Find the LAST BULLISH (buying) candle in the LEFT leg of the swing. When price rallies up, it taps the LOWER WICK of this candle and reverses back down. Again — only look in the left leg.

After price taps the IOF candle, it can reverse from:
- The last POI in that leg
- An opposite IOF candle
- An external swing high/low
- Internal weekly/daily swings

If your stop losses are continuously hitting, you are in the wrong direction relative to big players. Accept it and flip your bias.`,
  },
  {
    n: 6,
    title: "Institutional Order Flow Drills",
    body: `The 90/10 rule:
90% of your trading success = correctly identifying the DRAW ON LIQUIDITY (where price is going). Only 10% = the entry module. Most traders fail because they obsess over entries while completely misidentifying the target.

What counts as Draw on Liquidity (DOL):
- Previous month high and low
- Previous week high and low
- Previous day high and low
- Recent untapped swing highs and lows
- Clean highs and lows (equal highs/lows)

Entry framework in New York killzone:
- With high confidence in DOL: wait for retracement to 15-min POI in NY killzone. Confirm with reversal candle on 5-min OR 3-candle swing on 1-min. Enter with target = your DOL.
- With lower confidence: wait for displacement (strong move creating new POIs). Then enter on retracement to the newly created POI.

Common mistake: Marking yesterday's high as the target when price already TAPPED a bearish POI at that level yesterday. The real target is the LAST POI created in the bearish leg BELOW — not the high from which price already reversed.

Always ask: has price already delivered FROM this level? If yes, it is no longer a valid target.`,
  },
  {
    n: 7,
    title: "Liquidity Delivery",
    body: `External Range Liquidity:
The main swing highs and swing lows on your chosen reference timeframe. These are the MAJOR targets price is always ultimately hunting. If daily is your external timeframe: daily swing high and low = external.

Internal Range Liquidity:
Everything INSIDE the external range: order blocks, FVGs, volume imbalance, gap imbalance, internal swings on lower timeframes. These are TEMPORARY levels. They cause short-term reactions but cannot change the overall direction.

3 price delivery patterns:
1. External → External: Direct move. No hurdles. Explosive momentum (Low Resistance).
2. External → Internal → External: One hurdle. Price goes from external swing low, hits a bearish internal POI (temporary reversal), then continues to break the external swing high.
3. External → Internal → Internal → External: Multiple hurdles. Price hits bearish POI (reverses), then hits bullish POI (refuels), then continues to external swing high.

Understand EVERY structure change along this path. Internal levels are only speed bumps on the road to the external destination.`,
  },
  {
    n: 8,
    title: "Open Float",
    body: `Open Float tells you the long-term directional bias. It shows you the major swing high and major swing low that price is ultimately hunting, and what it will collect as fuel on the way there.

Liquidity targets in Open Float:
- Previous month high and low
- Previous week high and low
- Previous quarter (3-month) high and low
- Previous 6-month high and low
- Previous 12-month (annual) high and low

How to mark quarters:
In the daily timeframe, go back 2–3 years. Draw a vertical line every 3 months. Mark the HIGH and LOW of each 3-month quarter. This reveals the overall major swing high, overall major swing low, and all untapped quarter highs/lows.

Starting point: Begin from today's month and count backward in 3-month blocks.

How Open Float works:
After price makes an MSS (Market Structure Shift) at the overall swing low → it moves toward the overall swing high, collecting previous quarter, month, and week highs/lows as fuel stops along the way.

MSS is mandatory: A Market Structure Shift in the daily timeframe is REQUIRED before a new directional rally begins. No MSS = no confirmed direction change.

Reading big player direction:
- If sell-side stops are continuously safe but buy-side stops keep hitting → big players are in UPSIDE direction.
- If buy-side stops are safe but sell-side keeps hitting → big players are in DOWNSIDE direction.`,
  },
  {
    n: 9,
    title: "Market Maker Manipulation Templates",
    body: `These templates describe on which day of the week the HIGH and LOW of the week forms.

The 7 weekly templates:
1. Classic Tuesday High of the Week — Monday consolidates or sweeps lows. Tuesday makes the weekly high. Wednesday–Friday retraces downward.
2. Classic Tuesday Low of the Week — Monday consolidates or sweeps highs. Tuesday makes the weekly low. Wednesday–Friday retraces upward.
3. Wednesday High of the Week — Price needed extra time (Monday–Tuesday consolidation or additional POI tap) before reaching the weekly premium target on Wednesday.
4. Wednesday Low of the Week — Price sweeps Monday–Tuesday highs to trap buyers, then drives hard down on Wednesday to make the weekly low.
5. Consolidation Thursday Reversal — Price ranges Monday through Wednesday. The real institutional move happens on Thursday.
6. Consolidation Midweek Rally — Early week consolidation, then a strong bullish move mid-week. Friday closes near highs.
7. Consolidation Midweek Decline — Early week consolidation, then a strong bearish move mid-week. Friday closes near lows.

3 steps every Monday before trading:
- Know everything about the previous week — untapped POIs, structure, what situation price is in
- Check Forex Factory — which day has high-impact news (FOMC, CPI, NFP)? News day often = high or low of week
- Predict what can happen this week based on POIs + news timing. Match to one of the 7 templates.

Never use the same template blindly every week. The template changes depending on structure and news.`,
  },
  {
    n: 10,
    title: "Short Term Trading Model (Weekly Candle)",
    body: `Discipline is the most important factor. You must wait for price to enter the EXACT zone before entering. Buy from discount only. Sell from premium only. No exceptions.

Monthly candle → weekly bias:
When 2–3 consecutive bullish monthly candles form → the next monthly candle is likely bearish (needs to retrace and tap last POI). When 2–3 consecutive bearish monthly candles form → the next is likely bullish. Big players need to collect liquidity before continuing.

The Last POI is everything:
Know the last POI in monthly, weekly, daily, 4-hr, and 1-hr timeframes. When you know all last POIs, you can predict the next candle direction and the liquidity target.

Confluence zones:
If multiple POIs exist in one leg, check if any are confluence zones (multiple timeframes overlapping at the same price). Price will bounce from confluence zones and may not reach the very last POI. Single isolated POIs — price will definitely reach the last one.

Impulsive vs pullback leg size:
The impulsive leg is ALWAYS larger. The pullback leg is always smaller (reverses from equilibrium at 50% or from a POI at 70–80%). If both legs are equal size, the trend is not continuing.`,
  },
  {
    n: 11,
    title: "CISD (Change In State of Delivery)",
    body: `CISD = Change In State of Delivery. It is part of algorithmic order flow and signals a TREND CHANGE. It happens at Higher Timeframe POIs during pullbacks. Big players use CISD to trap retail traders who enter on the initial false move.

Dual chart analysis:
Always analyze two opposing charts simultaneously. Gold (XAUUSD) + Dollar (DXY). If DXY shows a buy program → XAUUSD shows a sell program. GBPUSD: GBP up = Dollar down. Both charts must show opposite directions.

How bullish CISD works step by step:
1. Price taps a Higher Timeframe bullish POI (discount zone)
2. Price makes an initial bullish bounce — retail traders enter LONG here (this is the TRAP)
3. Price reverses back DOWN, breaks the initial swing low, sweeps EXTERNAL LIQUIDITY (stops of those who bought the bounce)
4. In this bearish reversal leg: identify the CISD candles (bearish candles near the external sweep area)
5. Price then breaks the MSS point (initial swing high) upward
6. During the pullback, price taps the CISD candle HIGH → THIS is your LONG entry
7. Target = the main short-term liquidity (next higher high or external swing)

Finding CISD candles:
- If all candles in the reversal leg are bearish → the latest candle's high = entry.
- If there are mixed candles → bearish candles near the external sweep area = CISD candles.`,
  },
  {
    n: 12,
    title: "Daily-Weekly-Monthly Blueprint",
    body: `Every morning before the market opens, you must PREDICT what type of daily candle will form today.

The daily candle templates:
- OLHC (Open → Low → High → Close): Bullish day. Asian goes down → London goes up → NY continues up.
- OHLC (Open → High → Low → Close): Bearish day. Asian goes up → London goes down → NY continues down.
- OHC: Bullish with no lower wick. All three sessions move up.
- OLC: Bearish with no upper wick. All three sessions move down.
- OH: Pure bullish candle — no wicks at all. Maximum bullish momentum.
- OL: Pure bearish candle — no wicks at all. Maximum bearish momentum.
- Bullish/Bearish Doji: Indecision. Mixed session behavior with close near open.

Prediction process (do this every morning):
1. Read previous 3–4 days of structure
2. Identify all untapped POIs
3. Think through every possible candle type and write a justification for each
4. Select the most likely template based on structure
5. Plan each session's expected behavior based on that template

Templates change every day. Rebuild your plan from scratch each morning.`,
  },
  {
    n: 13,
    title: "Asian Session",
    body: `Timing (Indian Standard Time):
- Normal season: pre-market structure 03:30–05:30 AM IST, Asian session begins around 05:00 AM IST.
- Winter season: pre-market 04:30–06:30 AM IST.

The Asian session moves SMOOTHLY and is less volatile than London and New York.

Which pairs to trade in Asian session:
Trade USDJPY or AUDUSD ONLY. These two pairs have high-impact news from Japan and Australia during the Asian session. News creates momentum. All other pairs including Gold have no major Asian session news — they create narrow, sideways, trap-heavy movements. Avoid them.

Monday gap setups:
Forex markets always open Monday with a gap-up or gap-down from Friday's close. Price's first move is almost always to FILL the gap.

- Whiplash Short: Monday opens gap-UP → price moves DOWN to fill the gap toward Friday's high or close. Wait for MSS + FVG in a lower timeframe → enter SHORT on retracement to the FVG → target = Friday's high or close.
- Whiplash Buy: Monday opens gap-DOWN → price moves UP to fill the gap toward Friday's low or close. Wait for MSS + FVG → enter LONG on retracement to the FVG → target = Friday's low or close.
- Catapult Buy: After the Whiplash Short completes (gap filled going down), price makes a strong bullish reversal. Enter LONG on retracement to the new FVG → target = actual upside weekly direction.
- Catapult Sell: After the Whiplash Buy completes (gap filled going up), price makes a strong bearish reversal. Enter SHORT on retracement to the new FVG → target = actual downside weekly direction.

The sequence is: Whiplash (gap fill) → price taps Friday level → Catapult reversal → enter on FVG → target actual weekly direction.`,
  },
  {
    n: 14,
    title: "London & New York Sessions with Structure",
    body: `Structure is the most important thing in all of trading. Every ICT concept — CBDR, Killzone entries, Turtle Soup, MMBM, MMSM, Seek & Destroy — ONLY works when structure is correctly read. Without proper structure reading, every concept fails.

High Resistance Liquidity in sessions:
Opposite POIs exist on the path during London or NY. Price slows, reverses temporarily at each opposite POI, wastes time before continuing. London may partially reverse the Asian move because of HRL from opposite POIs blocking the path.

Low Resistance Liquidity in sessions:
No opposite POIs on the path. London or NY moves explosively with full momentum. You get the big trending session days. Before any session, check: are there any opposite POIs between current price and target?

3-candle swing + 4th candle framework at HTF POIs:
When price reaches a Higher Timeframe POI — do NOT enter immediately. Wait for a 3-candle swing formation. This is your first filter.

After 3-candle swing confirms: mark all opposite POIs on the path. If they exist → High Resistance (more time needed). If none → Low Resistance (mark swing high/low as target, expect explosive move).

Predict the 4th candle: will it go directly to the bias? Or pull back to tap the last POI from the 3rd candle first?

Timeframe interconnection:
23 hourly candles shape one daily candle. 5 daily candles shape one weekly candle. What happens on lower timeframes IS the higher timeframe candle. They are always linked.`,
  },
  {
    n: 15,
    title: "Structure with Detailed Way",
    body: `How POIs are created across timeframes:
When price makes a strong momentum move on a lower timeframe WITHOUT returning to tap the last POI on that timeframe, it creates a new POI on the NEXT HIGHER timeframe.

The fractal ladder:
- Strong 15-min move (skips last 15-min POI) → creates 1-HR POI
- Strong 1-hr move (skips last 1-hr POI) → creates 4-HR POI
- Strong 4-hr move (skips last 4-hr POI) → creates DAILY POI
- Strong daily move (skips last daily POI) → creates WEEKLY POI
- Strong weekly move (skips last weekly POI) → creates MONTHLY POI

Once a higher-TF POI is created, price gives PRIORITY to it. It will not return to the lower-TF POI. Lower-TF POIs on the path are only temporary obstacles.

Internal vs External structure:
Choose a reference timeframe. Mark the 3-candle swing high and 3-candle swing low → these are External Point A and External Point B. Everything created between them on lower timeframes = Internal.

Internal swings are TEMPORARY. They cannot change the overall direction. Price always ultimately moves toward the external target.

Point A to Point B trading (bullish example):
External Point A = daily bullish POI. External Point B = daily bearish POI above. Shift to 1-hr or 15-min. As price moves upward: it breaks each internal swing high → pulls back to last bullish POI → enter long → target next internal swing high → repeat this process until the external Point B is reached.

Mark ALL untapped POIs in every timeframe. When price finally reaches its target and reverses, it will tap ALL these untapped POIs on the way back. These form your complete reversal roadmap. Never delete an untapped POI from your chart.

Bias is the key to everything. You cannot find Point A and Point B without bias. Bias comes from reading all timeframes correctly from Monthly → Weekly → Daily → lower timeframes. Patience, observation, and control are required to read fractal structure properly.`,
  },
];

function NotesPage() {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Backtest
          </Link>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <BookOpen className="h-4 w-4 text-primary" /> Course Notes
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-6 py-8">
        <h1 className="font-display text-3xl font-semibold">PHASE 4 — Complete Trading Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">Lectures 1–15. Click any lecture to expand.</p>

        <div className="mt-6 space-y-3">
          {lectures.map((l) => {
            const isOpen = openId === l.n;
            return (
              <div key={l.n} className="rounded-lg border bg-card">
                <button
                  onClick={() => setOpenId(isOpen ? null : l.n)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-accent/30"
                >
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Lecture {l.n}</div>
                    <div className="mt-0.5 font-medium">{l.title}</div>
                  </div>
                  <div className="text-muted-foreground">{isOpen ? "−" : "+"}</div>
                </button>
                {isOpen && (
                  <div className="border-t px-5 py-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
{l.body}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
