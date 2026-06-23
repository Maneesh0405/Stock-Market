import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { equityCurve, stats } from "@/lib/mock-data";

export function EquityCurve() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Equity Curve</h3>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
            ${stats.finalBalance.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Starting balance</span>
          <p className="text-sm font-medium tabular-nums">$10,000</p>
        </div>
      </div>
      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityCurve} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--bull)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--bull)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Balance"]}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--bull)"
              strokeWidth={2}
              fill="url(#eq)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
