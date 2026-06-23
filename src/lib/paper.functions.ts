import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      { headers: { "User-Agent": UA, Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as any;
    const p = j?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return typeof p === "number" ? p : null;
  } catch {
    return null;
  }
}

async function fetchPrices(symbols: string[]): Promise<Record<string, number>> {
  const uniq = Array.from(new Set(symbols));
  const out: Record<string, number> = {};
  await Promise.all(
    uniq.map(async (s) => {
      const p = await fetchPrice(s);
      if (p != null) out[s] = p;
    }),
  );
  return out;
}

function shouldTrigger(
  order: { side: string; type: string; limit_price: number | null; trigger_price: number | null },
  price: number,
): boolean {
  const lp = Number(order.limit_price ?? 0);
  const tp = Number(order.trigger_price ?? 0);
  if (order.type === "limit") {
    if (order.side === "buy") return price <= lp;
    return price >= lp;
  }
  if (order.type === "stop_loss") {
    if (order.side === "sell") return price <= tp;
    return price >= tp;
  }
  if (order.type === "take_profit") {
    if (order.side === "sell") return price >= tp;
    return price <= tp;
  }
  return false;
}

function fillPriceFor(order: any, price: number): number {
  if (order.type === "limit") return Number(order.limit_price);
  if (order.type === "stop_loss" || order.type === "take_profit")
    return Number(order.trigger_price);
  return price;
}

async function applyFill(
  supabase: any,
  userId: string,
  order: { id: string; symbol: string; side: string; qty: number },
  price: number,
) {
  const qty = Number(order.qty);
  const cost = qty * price;

  // Load account + existing position
  const { data: acct } = await supabase
    .from("paper_accounts")
    .select("cash")
    .eq("user_id", userId)
    .single();
  if (!acct) return { ok: false, reason: "no account" };

  const { data: pos } = await supabase
    .from("paper_positions")
    .select("id, qty, avg_price")
    .eq("user_id", userId)
    .eq("symbol", order.symbol)
    .maybeSingle();

  if (order.side === "buy") {
    if (Number(acct.cash) < cost) return { ok: false, reason: "insufficient cash" };
    const oldQty = pos ? Number(pos.qty) : 0;
    const oldAvg = pos ? Number(pos.avg_price) : 0;
    const newQty = oldQty + qty;
    const newAvg = newQty > 0 ? (oldAvg * oldQty + price * qty) / newQty : 0;
    if (pos) {
      await supabase
        .from("paper_positions")
        .update({ qty: newQty, avg_price: newAvg })
        .eq("id", pos.id);
    } else {
      await supabase.from("paper_positions").insert({
        user_id: userId,
        symbol: order.symbol,
        qty: newQty,
        avg_price: newAvg,
      });
    }
    await supabase
      .from("paper_accounts")
      .update({ cash: Number(acct.cash) - cost })
      .eq("user_id", userId);
  } else {
    // sell
    const oldQty = pos ? Number(pos.qty) : 0;
    if (oldQty < qty) return { ok: false, reason: "insufficient holdings" };
    const remaining = oldQty - qty;
    if (remaining <= 0.0000001) {
      await supabase.from("paper_positions").delete().eq("id", pos!.id);
    } else {
      await supabase.from("paper_positions").update({ qty: remaining }).eq("id", pos!.id);
    }
    await supabase
      .from("paper_accounts")
      .update({ cash: Number(acct.cash) + cost })
      .eq("user_id", userId);
  }

  await supabase
    .from("paper_orders")
    .update({ status: "filled", fill_price: price, filled_at: new Date().toISOString() })
    .eq("id", order.id);
  return { ok: true };
}

async function ensureAccountRow(supabase: any, userId: string) {
  const { data } = await supabase
    .from("paper_accounts")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) {
    await supabase.from("paper_accounts").insert({
      user_id: userId,
      starting_balance: 100000,
      cash: 100000,
      currency: "INR",
    });
  }
}

/* ---------------- Server Functions ---------------- */

export const getPortfolio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAccountRow(supabase, userId);

    // Process pending orders first
    const { data: open } = await supabase
      .from("paper_orders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "open");

    if (open && open.length > 0) {
      const symbols = open.map((o: any) => o.symbol);
      const prices = await fetchPrices(symbols);
      for (const o of open) {
        const p = prices[o.symbol];
        if (p == null) continue;
        if (shouldTrigger(o, p)) {
          await applyFill(supabase, userId, o, fillPriceFor(o, p));
        }
      }
    }

    const [{ data: account }, { data: positions }, { data: orders }] = await Promise.all([
      supabase.from("paper_accounts").select("*").eq("user_id", userId).single(),
      supabase.from("paper_positions").select("*").eq("user_id", userId).order("symbol"),
      supabase
        .from("paper_orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    const symbols = (positions ?? []).map((p: any) => p.symbol);
    const prices = symbols.length > 0 ? await fetchPrices(symbols) : {};

    const enrichedPositions = (positions ?? []).map((p: any) => {
      const last = prices[p.symbol] ?? null;
      const qty = Number(p.qty);
      const avg = Number(p.avg_price);
      const value = last != null ? last * qty : null;
      const pnl = last != null ? (last - avg) * qty : null;
      const pnlPct = last != null && avg > 0 ? ((last - avg) / avg) * 100 : null;
      return { ...p, qty, avg_price: avg, last_price: last, market_value: value, pnl, pnl_pct: pnlPct };
    });

    const investedValue = enrichedPositions.reduce(
      (s, p) => s + (p.market_value ?? p.qty * p.avg_price),
      0,
    );
    const equity = Number(account!.cash) + investedValue;
    const totalPnl = equity - Number(account!.starting_balance);
    const totalPnlPct =
      Number(account!.starting_balance) > 0
        ? (totalPnl / Number(account!.starting_balance)) * 100
        : 0;

    return {
      account: {
        ...account!,
        cash: Number(account!.cash),
        starting_balance: Number(account!.starting_balance),
      },
      positions: enrichedPositions,
      orders: orders ?? [],
      equity,
      invested_value: investedValue,
      total_pnl: totalPnl,
      total_pnl_pct: totalPnlPct,
    };
  });

const PlaceOrderSchema = z.object({
  symbol: z.string().trim().min(1).max(20),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit", "stop_loss", "take_profit"]),
  qty: z.number().positive().max(1_000_000),
  limit_price: z.number().positive().optional().nullable(),
  trigger_price: z.number().positive().optional().nullable(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PlaceOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await ensureAccountRow(supabase, userId);

    const symbol = data.symbol.toUpperCase();

    if (data.type === "market") {
      const price = await fetchPrice(symbol);
      if (price == null) return { ok: false, error: "Could not fetch price for symbol" };

      const { data: inserted, error: insErr } = await supabase
        .from("paper_orders")
        .insert({
          user_id: userId,
          symbol,
          side: data.side,
          type: "market",
          qty: data.qty,
          status: "open",
        })
        .select()
        .single();
      if (insErr || !inserted) return { ok: false, error: insErr?.message ?? "Insert failed" };

      const fill = await applyFill(supabase, userId, inserted as any, price);
      if (!fill.ok) {
        await supabase.from("paper_orders").update({ status: "cancelled" }).eq("id", inserted.id);
        return { ok: false, error: fill.reason ?? "Fill rejected" };
      }
      return { ok: true, filled: true, price };
    }

    // Pending orders
    if (data.type === "limit" && data.limit_price == null)
      return { ok: false, error: "limit_price required" };
    if ((data.type === "stop_loss" || data.type === "take_profit") && data.trigger_price == null)
      return { ok: false, error: "trigger_price required" };

    // For sell-side pending orders, ensure user holds the qty
    if (data.side === "sell") {
      const { data: pos } = await supabase
        .from("paper_positions")
        .select("qty")
        .eq("user_id", userId)
        .eq("symbol", symbol)
        .maybeSingle();
      if (!pos || Number(pos.qty) < data.qty)
        return { ok: false, error: "You don't hold enough of this symbol to place a sell order" };
    }

    const { error } = await supabase.from("paper_orders").insert({
      user_id: userId,
      symbol,
      side: data.side,
      type: data.type,
      qty: data.qty,
      limit_price: data.limit_price ?? null,
      trigger_price: data.trigger_price ?? null,
      status: "open",
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, filled: false };
  });

export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("paper_orders")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

export const resetAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ starting_balance: z.number().positive().max(1_000_000_000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("paper_positions").delete().eq("user_id", userId);
    await supabase.from("paper_orders").delete().eq("user_id", userId);
    await ensureAccountRow(supabase, userId);
    const { error } = await supabase
      .from("paper_accounts")
      .update({ starting_balance: data.starting_balance, cash: data.starting_balance })
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

export const setDisplayName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ display_name: z.string().trim().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await ensureAccountRow(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("paper_accounts")
      .update({ display_name: data.display_name })
      .eq("user_id", context.userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: accounts }, { data: positions }] = await Promise.all([
      supabaseAdmin.from("paper_accounts").select("user_id, display_name, starting_balance, cash, currency"),
      supabaseAdmin.from("paper_positions").select("user_id, symbol, qty, avg_price"),
    ]);

    const symbols = Array.from(new Set((positions ?? []).map((p: any) => p.symbol)));
    const prices = symbols.length > 0 ? await fetchPrices(symbols) : {};

    const byUser = new Map<string, { invested: number; book: number }>();
    for (const p of positions ?? []) {
      const q = Number(p.qty);
      const avg = Number(p.avg_price);
      const last = prices[p.symbol];
      const v = last != null ? last * q : avg * q;
      const cur = byUser.get(p.user_id) ?? { invested: 0, book: 0 };
      cur.invested += v;
      cur.book += avg * q;
      byUser.set(p.user_id, cur);
    }

    const rows = (accounts ?? []).map((a: any) => {
      const agg = byUser.get(a.user_id) ?? { invested: 0, book: 0 };
      const equity = Number(a.cash) + agg.invested;
      const start = Number(a.starting_balance);
      const pnl = equity - start;
      const pct = start > 0 ? (pnl / start) * 100 : 0;
      return {
        user_id: a.user_id,
        display_name: a.display_name ?? "Trader",
        currency: a.currency,
        starting_balance: start,
        equity,
        pnl,
        pnl_pct: pct,
        is_me: a.user_id === context.userId,
      };
    });

    rows.sort((a, b) => b.pnl_pct - a.pnl_pct);
    return { rows: rows.slice(0, 100) };
  });
