import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Trophy, Pencil, RefreshCw } from "lucide-react";
import { getLeaderboard, setDisplayName } from "@/lib/paper.functions";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard · Edgewise Paper Trading" },
      { name: "description", content: "Top paper-trading portfolios ranked by % P&L." },
    ],
  }),
  component: LeaderboardPage,
});

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function LeaderboardPage() {
  const fetchBoard = useServerFn(getLeaderboard);
  const renameFn = useServerFn(setDisplayName);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchBoard(),
    refetchInterval: 30_000,
  });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const me = data?.rows.find((r) => r.is_me);

  const saveName = async () => {
    if (!name.trim()) return;
    const r = await renameFn({ data: { display_name: name.trim() } });
    if (!r.ok) toast.error(r.error ?? "Failed");
    else {
      toast.success("Name updated");
      setEditing(false);
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-6 py-3">
          <Link to="/paper" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Paper Trading
          </Link>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <Trophy className="h-4 w-4 text-primary" /> Leaderboard
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Top Practice Portfolios</h1>
            <p className="text-sm text-muted-foreground">Ranked by % return vs starting balance.</p>
          </div>
          {me && (
            <div className="rounded-lg border bg-card px-4 py-2 text-sm">
              <span className="text-muted-foreground">You:</span>{" "}
              {editing ? (
                <span className="inline-flex items-center gap-1">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={me.display_name}
                    className="rounded border bg-background px-2 py-0.5 text-sm"
                  />
                  <button onClick={saveName} className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Save
                  </button>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium">{me.display_name}</span>
                  <button onClick={() => { setName(me.display_name); setEditing(true); }} className="text-muted-foreground hover:text-foreground">
                    <Pencil className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 w-12">#</th>
                <th className="px-3 py-2">Trader</th>
                <th className="px-3 py-2 text-right">Starting</th>
                <th className="px-3 py-2 text-right">Equity</th>
                <th className="px-3 py-2 text-right">P&L</th>
                <th className="px-3 py-2 text-right">Return</th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows ?? []).map((r, i) => (
                <tr
                  key={r.user_id}
                  className={`border-t ${r.is_me ? "bg-primary/5" : ""}`}
                >
                  <td className="px-3 py-2 tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2">
                    {r.display_name}
                    {r.is_me && <span className="ml-2 rounded bg-primary/20 px-1.5 text-[10px] text-primary">YOU</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.currency} {fmt(r.starting_balance)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.currency} {fmt(r.equity)}
                  </td>
                  <td className={`px-3 py-2 text-right tabular-nums ${r.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {r.pnl >= 0 ? "+" : ""}{fmt(r.pnl)}
                  </td>
                  <td className={`px-3 py-2 text-right tabular-nums font-semibold ${r.pnl_pct >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {r.pnl_pct >= 0 ? "+" : ""}{fmt(r.pnl_pct)}%
                  </td>
                </tr>
              ))}
              {(data?.rows ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No traders yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
