import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCw, Sparkles } from "lucide-react";
import { getQuotes, type Quote } from "@/lib/market.functions";

export const Route = createFileRoute("/signals")({
  head: () => ({
    meta: [
      { title: "Live Market Signals · Edgewise" },
      {
        name: "description",
        content:
          "Live daily stock market data — indices, stocks, commodities, forex, and crypto. Auto-refreshing quotes.",
      },
    ],
  }),
  component: SignalsPage,
});

type Group = { title: string; subtitle: string; symbols: string[] };

const GROUPS: Group[] = [
  {
    title: "US Indices",
    subtitle: "Benchmark indices for the US market",
    symbols: ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX"],
  },
  {
    title: "Global Indices",
    subtitle: "Major world indices",
    symbols: ["^FTSE", "^GDAXI", "^FCHI", "^N225", "^HSI", "^NSEI", "^BSESN"],
  },
  {
    title: "Mega-Cap Stocks",
    subtitle: "Most-watched US equities",
    symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK-B"],
  },
  {
    title: "Commodities & Metals",
    subtitle: "Gold, silver, oil, gas (futures)",
    symbols: ["GC=F", "SI=F", "CL=F", "BZ=F", "NG=F", "HG=F"],
  },
  {
    title: "Forex",
    subtitle: "Major currency pairs + DXY",
    symbols: ["DX-Y.NYB", "EURUSD=X", "GBPUSD=X", "USDJPY=X", "USDINR=X", "AUDUSD=X"],
  },
  {
    title: "Crypto",
    subtitle: "Top digital assets (24/7)",
    symbols: ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "DOGE-USD"],
  },
];

const ALL_SYMBOLS = GROUPS.flatMap((g) => g.symbols);

function SignalsPage() {
  const fetchQuotes = useServerFn(getQuotes);
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["quotes", ALL_SYMBOLS],
    queryFn: () => fetchQuotes({ data: { symbols: ALL_SYMBOLS } }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });

  const quotesBySymbol = new Map<string, Quote>();
  data?.quotes.forEach((q) => quotesBySymbol.set(q.symbol, q));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-6 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Backtest
          </Link>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Live Market Signals
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-semibold">Live Daily Market</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time quotes across indices, stocks, commodities, forex, and crypto. Auto-refreshes every 30 seconds.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {dataUpdatedAt
              ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`
              : "Loading…"}
          </div>
        </div>

        {error || data?.error ? (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {data?.error ?? "Failed to load market data. Will retry automatically."}
          </div>
        ) : null}

        <div className="space-y-6">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <div className="mb-2">
                <h2 className="font-display text-lg font-semibold">{group.title}</h2>
                <p className="text-xs text-muted-foreground">{group.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.symbols.map((sym) => (
                  <QuoteCard
                    key={sym}
                    symbol={sym}
                    quote={quotesBySymbol.get(sym)}
                    loading={isLoading}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Data delayed 15 min for some exchanges. For informational use only — not investment advice.
        </footer>
      </main>
    </div>
  );
}

function QuoteCard({
  symbol,
  quote,
  loading,
}: {
  symbol: string;
  quote: Quote | undefined;
  loading: boolean;
}) {
  if (!quote) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="text-xs text-muted-foreground">{symbol}</div>
        <div className="mt-2 h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-16 animate-pulse rounded bg-muted" />
        {!loading && (
          <div className="mt-2 text-xs text-muted-foreground">Unavailable</div>
        )}
      </div>
    );
  }

  const up = (quote.changePct ?? 0) >= 0;
  const sign = up ? "+" : "";
  const priceFmt = (n: number | null) =>
    n == null
      ? "—"
      : n >= 1000
      ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : n.toFixed(n < 10 ? 4 : 2);

  return (
    <div className="rounded-lg border bg-card p-4 transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{quote.name || symbol}</div>
          <div className="text-xs text-muted-foreground">{quote.symbol}</div>
        </div>
        <span
          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium ${
            up
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-red-500/15 text-red-500"
          }`}
        >
          {up ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {sign}
          {quote.changePct?.toFixed(2) ?? "0.00"}%
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="font-display text-2xl font-semibold tabular-nums">
          {priceFmt(quote.price)}
        </div>
        <div
          className={`text-xs tabular-nums ${up ? "text-emerald-500" : "text-red-500"}`}
        >
          {sign}
          {quote.change?.toFixed(2) ?? "0.00"}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
        <div>
          <div>Prev</div>
          <div className="text-foreground/80 tabular-nums">{priceFmt(quote.prevClose)}</div>
        </div>
        <div>
          <div>High</div>
          <div className="text-foreground/80 tabular-nums">{priceFmt(quote.dayHigh)}</div>
        </div>
        <div>
          <div>Low</div>
          <div className="text-foreground/80 tabular-nums">{priceFmt(quote.dayLow)}</div>
        </div>
      </div>
    </div>
  );
}
