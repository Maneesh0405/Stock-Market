import { Brain, Check, Loader2, Circle } from "lucide-react";
import { prediction } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function AIPanel() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">
            Today's Predicted Template
          </h3>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="font-display text-4xl font-semibold tracking-tight">
            {prediction.template}
          </span>
          <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
            {prediction.confidence}% confidence
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{prediction.templateName}</p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Feature Importance</h3>
        <ul className="mt-4 space-y-3">
          {prediction.reasons.map((r, i) => (
            <li key={i}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {i + 1}
                  </span>
                  {r.label}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {(r.weight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground/60"
                  style={{ width: `${r.weight * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-medium text-muted-foreground">Session Plan</h3>
        <ol className="mt-4 space-y-3">
          {prediction.sessions.map((s) => (
            <li key={s.name} className="flex gap-3">
              <div className="mt-0.5">
                {s.state === "done" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                ) : s.state === "active" ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Circle className="h-2 w-2" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      s.state === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {s.state}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.expected}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
