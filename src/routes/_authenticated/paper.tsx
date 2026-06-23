import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  Trash2,
  Trophy,
  RotateCcw,
} from "lucide-react";
import {
  getPortfolio,
  placeOrder,
  cancelOrder,
  resetAccount,
} from "@/lib/paper.functions";

export const Route = createFileRoute("/_authenticated/paper")({
  head: () => ({
    meta: [
      { title: "Paper Trading · Edgewise" },
      {
        name: "description",
        content:
          "Practice trading with virtual money. Place market, limit, stop-loss and take-profit orders against live market prices — risk-free.",
      },
    ],
  }),
  component: PaperPage,
});

const SUGGEST = [
  { label: "Indian", syms: ["^NSEI", "^NSEBANK", "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"] },
  { label: "US", syms: ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "META"] },
  { label: "Crypto", syms: ["BTC-USD", "ETH-USD", "SOL-USD"] },
  { label: "Commodities/FX", syms: ["GC=F", "CL=F", "EURUSD=X", "USDINR=X"] },
];

function fmt(n: number | null | undefined, d = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
}

function PaperPage() {
  const qc = useQueryClient();
  const fetchPortfolio = useServerFn(getPortfolio);
  const placeFn = useServerFn(placeOrder);
  const cancelFn = useServerFn(cancelOrder);
  const resetFn = useServerFn(resetAccount);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["paper-portfolio"],
    queryFn: () => fetchPortfolio(),
    refetchInterval: 20_000,
    staleTime: 10_000,
  });

  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"market" | "limit" | "stop_loss" | "take_profit">("market");
  const [qty, setQty] = useState<string>("1");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [triggerPrice, setTriggerPrice] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const acct = data?.account;
  const positions = data?.positions ?? [];
  const orders = data?.orders ?? [];
  const openOrders = useMemo(() => orders.filter((o: any) => o.status === "open"), [orders]);
  const history = useMemo(() => orders.filter((o: any) => o.status !== "open"), [orders]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(qty);
    if (!q || q <= 0) return toast.error("Quantity must be positive");
    setSubmitting(true);
    try {
      const res = await placeFn({
        data: {
          symbol: symbol.trim().toUpperCase(),
          side,
          type,
          qty: q,
          limit_price: type === "limit" ? Number(limitPrice) || undefined : undefined,
          trigger_price:
            type === "stop_loss" || type === "take_profit"
              ? Number(triggerPrice) || undefined
              : undefined,
        },
      });
      if (!res.ok) toast.error(res.error ?? "Order rejected");
      else if (res.filled) toast.success(`Filled @ ${fmt(res.price ?? null)}`);
      else toast.success("Order placed");
      qc.invalidateQueries({ queryKey: ["paper-portfolio"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async (id: string) => {
    const r = await cancelFn({ data: { id } });
    if (!r.ok) toast.error(r.error ?? "Cancel failed");
    else toast.success("Order cancelled");
    qc.invalidateQueries({ queryKey: ["paper-portfolio"] });
  };

  const onReset = async () => {
    const raw = window.prompt("Reset account. Enter new starting balance:", "100000");
    if (!raw) return;
    const n = Number(raw);
    if (!n || n <= 0) return toast.error("Invalid amount");
    const r = await resetFn({ data: { starting_balance: n } });
    if (!r.ok) toast.error(r.error ?? "Reset failed");
    else toast.success("Account reset");
    qc.invalidateQueries({ queryKey: ["paper-portfolio"] });
  };

  const cur = acct?.currency ?? "INR";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-6 py-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <Wallet className="h-4 w-4 text-primary" /> Paper Trading
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <Trophy className="h-3.5 w-3.5" /> Leaderboard
            </Link>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
              title="Wipe positions/orders and set new starting balance"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-6 py-6">
        {/* Summary */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Equity" value={`${cur} ${fmt(data?.equity)}`} hint="Cash + holdings value" />
          <Stat label="Cash" value={`${cur} ${fmt(acct?.cash)}`} hint="Available to invest" />
          <Stat label="Invested" value={`${cur} ${fmt(data?.invested_value)}`} hint="Market value of holdings" />
          <Stat
            label="Total P&L"
            value={`${(data?.total_pnl ?? 0) >= 0 ? "+" : ""}${cur} ${fmt(data?.total_pnl)}`}
            hint={`${fmt(data?.total_pnl_pct)}% vs starting`}
            tone={(data?.total_pnl ?? 0) >= 0 ? "up" : "down"}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Order ticket */}
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Place Order</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Virtual money. Live prices from Yahoo Finance.
            </p>

            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Symbol</label>
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:border-primary"
                  placeholder="AAPL · RELIANCE.NS · BTC-USD"
                />
                <div className="mt-2 space-y-1">
                  {SUGGEST.map((g) => (
                    <div key={g.label} className="flex flex-wrap items-center gap-1 text-[11px]">
                      <span className="w-20 text-muted-foreground">{g.label}</span>
                      {g.syms.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSymbol(s)}
                          className="rounded border bg-background px-1.5 py-0.5 font-mono hover:bg-accent"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide("buy")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    side === "buy"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setSide("sell")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    side === "sell"
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  Sell
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Order type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="market">Market (fills now)</option>
                  <option value="limit">Limit</option>
                  <option value="stop_loss">Stop-loss</option>
                  <option value="take_profit">Take-profit</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Quantity</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {type === "limit" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Limit price</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}

              {(type === "stop_loss" || type === "take_profit") && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Trigger price</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`mt-2 w-full rounded-md px-4 py-2.5 text-sm font-semibold text-primary-foreground transition disabled:opacity-50 ${
                  side === "buy"
                    ? "bg-emerald-600 hover:bg-emerald-600/90"
                    : "bg-red-600 hover:bg-red-600/90"
                }`}
              >
                {submitting ? "Placing…" : `${side === "buy" ? "Buy" : "Sell"} ${symbol.toUpperCase()}`}
              </button>
            </form>
          </section>

          <div className="space-y-6">
            {/* Holdings */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Holdings</h2>
                <span className="text-xs text-muted-foreground">{positions.length} positions</span>
              </div>
              {isLoading && !positions.length ? (
                <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : positions.length === 0 ? (
                <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                  No positions yet. Place an order to get started.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Avg</th>
                        <th className="px-3 py-2 text-right">Last</th>
                        <th className="px-3 py-2 text-right">Value</th>
                        <th className="px-3 py-2 text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((p: any) => (
                        <tr key={p.id} className="border-t">
                          <td className="px-3 py-2 font-mono">{p.symbol}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(p.qty, 4)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(p.avg_price)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(p.last_price)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(p.market_value)}</td>
                          <td
                            className={`px-3 py-2 text-right tabular-nums ${
                              (p.pnl ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {(p.pnl ?? 0) >= 0 ? "+" : ""}
                            {fmt(p.pnl)}{" "}
                            <span className="text-[11px] opacity-80">
                              ({fmt(p.pnl_pct)}%)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Open orders */}
            <section>
              <h2 className="mb-2 font-display text-lg font-semibold">Open Orders</h2>
              {openOrders.length === 0 ? (
                <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                  No pending orders.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Side</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Trigger</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {openOrders.map((o: any) => (
                        <tr key={o.id} className="border-t">
                          <td className="px-3 py-2 font-mono">{o.symbol}</td>
                          <td className={`px-3 py-2 uppercase ${o.side === "buy" ? "text-emerald-500" : "text-red-500"}`}>
                            {o.side}
                          </td>
                          <td className="px-3 py-2">{o.type}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(o.qty), 4)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {fmt(Number(o.limit_price ?? o.trigger_price ?? 0))}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => onCancel(o.id)}
                              className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-xs hover:bg-accent"
                            >
                              <Trash2 className="h-3 w-3" /> Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* History */}
            <section>
              <h2 className="mb-2 font-display text-lg font-semibold">Order History</h2>
              {history.length === 0 ? (
                <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                  No fills yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">When</th>
                        <th className="px-3 py-2">Symbol</th>
                        <th className="px-3 py-2">Side</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Price</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 50).map((o: any) => (
                        <tr key={o.id} className="border-t">
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {new Date(o.filled_at ?? o.created_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 font-mono">{o.symbol}</td>
                          <td className={`px-3 py-2 uppercase ${o.side === "buy" ? "text-emerald-500" : "text-red-500"}`}>
                            {o.side}
                          </td>
                          <td className="px-3 py-2">{o.type}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmt(Number(o.qty), 4)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {fmt(o.fill_price ? Number(o.fill_price) : null)}
                          </td>
                          <td className="px-3 py-2 text-xs">{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "up" | "down";
}) {
  const Icon = tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : null;
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`mt-1 flex items-center gap-1.5 font-display text-xl font-semibold tabular-nums ${
          tone === "up" ? "text-emerald-500" : tone === "down" ? "text-red-500" : ""
        }`}
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {value}
      </div>
      {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
