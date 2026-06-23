import { ArrowDown, ArrowUp } from "lucide-react";
import { trades } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function TradeLog() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">Trade Log</h3>
          <p className="text-xs text-muted-foreground">
            Every entry the algorithm took, with setup reason
          </p>
        </div>
        <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium">
          Last {trades.length} trades
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Pair</th>
              <th className="px-5 py-3 font-medium">Direction</th>
              <th className="px-5 py-3 font-medium">Session</th>
              <th className="px-5 py-3 text-right font-medium">Entry</th>
              <th className="px-5 py-3 text-right font-medium">Exit</th>
              <th className="px-5 py-3 text-right font-medium">R:R</th>
              <th className="px-5 py-3 text-right font-medium">P/L</th>
              <th className="px-5 py-3 font-medium">Setup Reason</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => {
              const isLong = t.direction === "Long";
              const isWin = t.pnl > 0;
              return (
                <tr key={t.id} className="border-b last:border-0 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3 tabular-nums text-muted-foreground">{t.date}</td>
                  <td className="px-5 py-3 font-medium">{t.pair}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                        isLong
                          ? "bg-[color:var(--bull)]/10 text-[color:var(--bull)]"
                          : "bg-[color:var(--bear)]/10 text-[color:var(--bear)]"
                      )}
                    >
                      {isLong ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {t.direction}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{t.session}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{t.entry}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{t.exit}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {t.rr > 0 ? `+${t.rr}` : t.rr}R
                  </td>
                  <td
                    className={cn(
                      "px-5 py-3 text-right font-semibold tabular-nums",
                      isWin ? "text-[color:var(--bull)]" : "text-[color:var(--bear)]"
                    )}
                  >
                    {isWin ? "+" : ""}${t.pnl}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{t.setup}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
