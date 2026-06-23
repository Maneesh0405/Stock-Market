import { ArrowUpRight, Activity, Target, TrendingUp, Wallet } from "lucide-react";
import { stats } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: "bull" | "bear" | "neutral";
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-3xl font-semibold tracking-tight tabular-nums",
            accent === "bull" && "text-[color:var(--bull)]",
            accent === "bear" && "text-[color:var(--bear)]"
          )}
        >
          {value}
        </span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

export function StatsBar() {
  const isBull = stats.marketState.includes("Bullish");
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat
        icon={TrendingUp}
        label="Total Return"
        value={`+${stats.totalReturn}%`}
        sub="24 months"
        accent="bull"
      />
      <Stat
        icon={Target}
        label="Win Rate"
        value={`${stats.winRate}%`}
        sub={`${stats.totalTrades} trades`}
      />
      <Stat
        icon={Wallet}
        label="Avg R:R"
        value={`${stats.avgRR}R`}
        sub={`-${stats.maxDrawdown}% max DD`}
      />
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Market State
          </span>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-2 w-2 rounded-full",
              isBull ? "bg-[color:var(--bull)]" : "bg-[color:var(--bear)]"
            )}
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            {stats.marketState}
          </span>
          <ArrowUpRight
            className={cn(
              "ml-auto h-4 w-4",
              isBull ? "text-[color:var(--bull)]" : "text-[color:var(--bear)] rotate-90"
            )}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Daily MSS confirmed · External liquidity above
        </p>
      </div>
    </div>
  );
}
