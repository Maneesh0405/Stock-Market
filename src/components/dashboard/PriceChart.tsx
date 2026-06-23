import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  CrosshairMode,
  createSeriesMarkers,
} from "lightweight-charts";
import { annotations, candles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// lightweight-charts cannot parse oklch()/lab()/etc. and modern browsers
// preserve oklch in getComputedStyle output, so we use a fixed safe palette.
const CHART_COLORS = {
  bull: "rgb(34, 170, 124)",
  bear: "rgb(220, 67, 53)",
  fg: "rgb(34, 39, 51)",
  muted: "rgb(125, 134, 153)",
  border: "rgb(229, 232, 238)",
  liquidity: "rgb(234, 179, 8)",
};

export function PriceChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [hover, setHover] = useState<(typeof annotations)[number] | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const { bull, bear, fg, muted, border } = CHART_COLORS;


    const chart = createChart(el, {
      width: el.clientWidth,
      height: 460,
      layout: {
        background: { color: "transparent" },
        textColor: fg,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: border, style: 1 },
        horzLines: { color: border, style: 1 },
      },
      rightPriceScale: { borderColor: border },
      timeScale: { borderColor: border, timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    });
    chartRef.current = chart;

    // Premium / Discount zones — derived from full visible swing
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const swingHigh = Math.max(...highs);
    const swingLow = Math.min(...lows);
    const equilibrium = (swingHigh + swingLow) / 2;

    // Top band (premium) using area between high and equilibrium
    const premium = chart.addSeries(AreaSeries, {
      topColor: "rgba(220, 50, 50, 0.10)",
      bottomColor: "rgba(220, 50, 50, 0.02)",
      lineColor: "rgba(0,0,0,0)",
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    premium.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: swingHigh })));

    const premiumBase = chart.addSeries(AreaSeries, {
      topColor: "rgba(0,0,0,0)",
      bottomColor: "rgba(0,0,0,0)",
      lineColor: "rgba(0,0,0,0)",
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    premiumBase.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: equilibrium })));

    const discount = chart.addSeries(AreaSeries, {
      topColor: "rgba(40, 180, 130, 0.12)",
      bottomColor: "rgba(40, 180, 130, 0.02)",
      lineColor: "rgba(0,0,0,0)",
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    discount.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: equilibrium })));

    // 50% equilibrium line
    const eqLine = chart.addSeries(LineSeries, {
      color: muted,
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    eqLine.setData(
      candles.map((c) => ({ time: c.time as UTCTimestamp, value: equilibrium }))
    );

    // Candles on top
    const series: ISeriesApi<"Candlestick"> = chart.addSeries(CandlestickSeries, {
      upColor: bull,
      downColor: bear,
      wickUpColor: bull,
      wickDownColor: bear,
      borderVisible: false,
    });
    series.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    // Annotation markers
    createSeriesMarkers(
      series,
      annotations.map((a) => ({
        time: a.time as UTCTimestamp,
        position: a.type === "entry-long" || a.type === "poi" ? "belowBar" : "aboveBar",
        color:
          a.type === "entry-long"
            ? bull
            : a.type === "entry-short"
              ? bear
              : a.type === "liquidity"
                ? "#eab308"
                : muted,
        shape:
          a.type === "entry-long"
            ? "arrowUp"
            : a.type === "entry-short"
              ? "arrowDown"
              : "circle",
        text: a.label,
      }))
    );

    chart.timeScale().fitContent();

    // Hover handler — surface tooltip when crosshair near an annotation
    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setHover(null);
        return;
      }
      const t = param.time as number;
      const near = annotations.find((a) => Math.abs(a.time - t) < 3600 * 6);
      setHover(near ?? null);
    });

    const ro = new ResizeObserver(() => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold tracking-tight">XAUUSD · 1H</h3>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              Backtest
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Premium / Discount zones, 50% equilibrium, IOF & CISD entries annotated
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Legend color="var(--bull)" label="Discount (Buy)" />
          <Legend color="var(--bear)" label="Premium (Sell)" />
          <Legend color="#eab308" label="Liquidity sweep" />
        </div>
      </div>
      <div className="relative">
        <div ref={containerRef} className="w-full" />
        {hover && (
          <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-lg border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur">
            <div
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                hover.type === "entry-long" && "text-[color:var(--bull)]",
                hover.type === "entry-short" && "text-[color:var(--bear)]",
                hover.type === "liquidity" && "text-yellow-600",
                hover.type === "poi" && "text-muted-foreground"
              )}
            >
              {hover.label} · {hover.price.toFixed(2)}
            </div>
            <p className="mt-1 text-sm text-foreground">{hover.tooltip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
