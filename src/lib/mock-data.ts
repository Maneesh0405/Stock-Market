// Mock ICT backtest data — simulates Python/FastAPI backend output

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Trade = {
  id: string;
  date: string;
  pair: string;
  direction: "Long" | "Short";
  entry: number;
  exit: number;
  pnl: number;
  rr: number;
  setup: string;
  session: "Asian" | "London" | "New York";
};

export type Annotation = {
  time: number;
  price: number;
  label: string;
  type: "entry-long" | "entry-short" | "exit" | "poi" | "liquidity";
  tooltip: string;
};

// Deterministic candles (XAUUSD-style, ~2000-2100 range, 1H)
function genCandles(count: number, start = 2000): Candle[] {
  const out: Candle[] = [];
  let price = start;
  // start ~6 months ago in 1H bars
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * 3600;
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < count; i++) {
    const drift = Math.sin(i / 18) * 0.6 + Math.cos(i / 55) * 1.2;
    const vol = 2 + rand() * 3;
    const open = price;
    const close = +(open + drift + (rand() - 0.5) * vol).toFixed(2);
    const high = +(Math.max(open, close) + rand() * vol * 0.8).toFixed(2);
    const low = +(Math.min(open, close) - rand() * vol * 0.8).toFixed(2);
    out.push({ time: startTime + i * 3600, open, high, low, close });
    price = close;
  }
  return out;
}

export const candles = genCandles(420, 2010);

// Find a few interesting swings for annotations
const last = candles[candles.length - 1];
const mid = candles[Math.floor(candles.length / 2)];
const q1 = candles[Math.floor(candles.length * 0.25)];
const q3 = candles[Math.floor(candles.length * 0.75)];

export const annotations: Annotation[] = [
  {
    time: q1.time,
    price: q1.low,
    label: "Long",
    type: "entry-long",
    tooltip: "Price tapped 1-Hr IOF Candle in Discount Zone",
  },
  {
    time: q3.time,
    price: q3.high,
    label: "Short",
    type: "entry-short",
    tooltip: "CISD Confirmation in Premium Zone (Bearish FVG retest)",
  },
  {
    time: mid.time,
    price: mid.high,
    label: "Sweep",
    type: "liquidity",
    tooltip: "External liquidity sweep — Previous Week High",
  },
  {
    time: last.time - 3600 * 24,
    price: last.low,
    label: "POI",
    type: "poi",
    tooltip: "Daily Bullish Order Block (untapped)",
  },
];

// Equity curve — 24 months
export const equityCurve = (() => {
  const pts: { month: string; balance: number }[] = [];
  let bal = 10000;
  let seed = 7;
  const months = [
    "Jan 24","Feb 24","Mar 24","Apr 24","May 24","Jun 24","Jul 24","Aug 24","Sep 24","Oct 24","Nov 24","Dec 24",
    "Jan 25","Feb 25","Mar 25","Apr 25","May 25","Jun 25","Jul 25","Aug 25","Sep 25","Oct 25","Nov 25","Dec 25",
  ];
  for (const m of months) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const change = 0.012 + r * 0.085 - (r > 0.78 ? 0.06 : 0);
    bal = +(bal * (1 + change)).toFixed(2);
    pts.push({ month: m, balance: bal });
  }
  return pts;
})();

export const stats = {
  totalReturn: ((equityCurve[equityCurve.length - 1].balance / 10000 - 1) * 100).toFixed(1),
  finalBalance: equityCurve[equityCurve.length - 1].balance,
  winRate: 64.3,
  totalTrades: 218,
  avgRR: 2.4,
  maxDrawdown: 8.7,
  marketState: "Bullish Open Float" as const,
};

export const trades: Trade[] = [
  { id: "T-218", date: "2025-12-18", pair: "XAUUSD", direction: "Long", entry: 2042.10, exit: 2068.40, pnl: 1315, rr: 3.2, setup: "Whiplash Buy → Catapult", session: "Asian" },
  { id: "T-217", date: "2025-12-17", pair: "XAUUSD", direction: "Short", entry: 2071.80, exit: 2055.20, pnl: 830, rr: 2.1, setup: "CISD Confirmation", session: "New York" },
  { id: "T-216", date: "2025-12-16", pair: "GBPUSD", direction: "Long", entry: 1.2640, exit: 1.2682, pnl: 420, rr: 2.8, setup: "3-Candle Swing + IOF tap", session: "London" },
  { id: "T-215", date: "2025-12-15", pair: "XAUUSD", direction: "Short", entry: 2058.50, exit: 2061.10, pnl: -260, rr: -1.0, setup: "Premium POI sell", session: "New York" },
  { id: "T-214", date: "2025-12-12", pair: "USDJPY", direction: "Long", entry: 149.20, exit: 150.05, pnl: 850, rr: 2.5, setup: "OLHC + Asian range high", session: "London" },
  { id: "T-213", date: "2025-12-11", pair: "XAUUSD", direction: "Long", entry: 2035.00, exit: 2049.70, pnl: 735, rr: 2.0, setup: "Discount OB tap", session: "London" },
  { id: "T-212", date: "2025-12-10", pair: "XAUUSD", direction: "Short", entry: 2065.30, exit: 2044.10, pnl: 1060, rr: 3.5, setup: "MMSM Wednesday High", session: "New York" },
  { id: "T-211", date: "2025-12-09", pair: "GBPUSD", direction: "Short", entry: 1.2705, exit: 1.2712, pnl: -70, rr: -1.0, setup: "Bearish FVG retest", session: "New York" },
  { id: "T-210", date: "2025-12-08", pair: "XAUUSD", direction: "Long", entry: 2028.40, exit: 2055.60, pnl: 1360, rr: 4.0, setup: "External sweep + MSS", session: "Asian" },
  { id: "T-209", date: "2025-12-05", pair: "USDJPY", direction: "Short", entry: 150.40, exit: 149.65, pnl: 750, rr: 2.2, setup: "OHLC daily template", session: "London" },
  { id: "T-208", date: "2025-12-04", pair: "XAUUSD", direction: "Long", entry: 2018.70, exit: 2034.20, pnl: 775, rr: 2.6, setup: "Quarter Low tap", session: "New York" },
  { id: "T-207", date: "2025-12-03", pair: "XAUUSD", direction: "Short", entry: 2048.10, exit: 2038.40, pnl: 485, rr: 1.6, setup: "1H Mitigation Block", session: "London" },
];

export const prediction = {
  template: "OLHC",
  templateName: "Open → Low → High → Close",
  confidence: 78,
  bias: "Bullish",
  reasons: [
    { label: "Previous day was Bullish Doji", weight: 0.34 },
    { label: "Price swept Asian session low", weight: 0.29 },
    { label: "High-impact news at NY open (CPI)", weight: 0.21 },
    { label: "Daily POI untapped in discount", weight: 0.16 },
  ],
  sessions: [
    { name: "Asian", expected: "Tap session low → liquidity grab", state: "done" },
    { name: "London", expected: "Reversal up from discount POI", state: "active" },
    { name: "New York", expected: "Continuation to previous day high", state: "pending" },
  ],
};
