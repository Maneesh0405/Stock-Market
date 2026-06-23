import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  symbols: z.array(z.string().min(1).max(20)).min(1).max(50),
});

export type Quote = {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
  prevClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  marketState: string | null;
  currency: string | null;
  time: number | null;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function fetchOne(symbol: string): Promise<Quote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: {
        result?: Array<{
          meta?: Record<string, unknown>;
        }>;
      };
    };
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price =
      typeof meta.regularMarketPrice === "number" ? meta.regularMarketPrice : null;
    const prev =
      typeof meta.chartPreviousClose === "number"
        ? meta.chartPreviousClose
        : typeof meta.previousClose === "number"
        ? (meta.previousClose as number)
        : null;
    const change = price != null && prev != null ? price - prev : null;
    const changePct = change != null && prev ? (change / prev) * 100 : null;

    return {
      symbol: String(meta.symbol ?? symbol),
      name: String(meta.shortName ?? meta.longName ?? meta.symbol ?? symbol),
      price,
      change,
      changePct,
      prevClose: prev,
      dayHigh: typeof meta.regularMarketDayHigh === "number" ? meta.regularMarketDayHigh : null,
      dayLow: typeof meta.regularMarketDayLow === "number" ? meta.regularMarketDayLow : null,
      marketState: null,
      currency: typeof meta.currency === "string" ? (meta.currency as string) : null,
      time: typeof meta.regularMarketTime === "number" ? (meta.regularMarketTime as number) : null,
    };
  } catch (err) {
    console.error(`fetchOne(${symbol}) failed`, err);
    return null;
  }
}

export const getQuotes = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<{ quotes: Quote[]; error: string | null }> => {
    try {
      const results = await Promise.all(data.symbols.map((s) => fetchOne(s)));
      const quotes = results.filter((q): q is Quote => q !== null);
      return { quotes, error: null };
    } catch (err) {
      console.error("getQuotes failed", err);
      return { quotes: [], error: "Failed to fetch market data" };
    }
  });
