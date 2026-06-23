
-- ============ paper_accounts ============
CREATE TABLE public.paper_accounts (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  starting_balance NUMERIC(20,4) NOT NULL DEFAULT 100000,
  cash NUMERIC(20,4) NOT NULL DEFAULT 100000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_accounts TO authenticated;
GRANT ALL ON public.paper_accounts TO service_role;
ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own account select" ON public.paper_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "leaderboard read" ON public.paper_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "own account insert" ON public.paper_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own account update" ON public.paper_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own account delete" ON public.paper_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ paper_positions ============
CREATE TABLE public.paper_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  qty NUMERIC(20,8) NOT NULL DEFAULT 0,
  avg_price NUMERIC(20,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_positions TO authenticated;
GRANT ALL ON public.paper_positions TO service_role;
ALTER TABLE public.paper_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own positions all" ON public.paper_positions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX paper_positions_user_idx ON public.paper_positions(user_id);

-- ============ paper_orders ============
CREATE TABLE public.paper_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy','sell')),
  type TEXT NOT NULL CHECK (type IN ('market','limit','stop_loss','take_profit')),
  qty NUMERIC(20,8) NOT NULL CHECK (qty > 0),
  limit_price NUMERIC(20,8),
  trigger_price NUMERIC(20,8),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','filled','cancelled')),
  fill_price NUMERIC(20,8),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  filled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_orders TO authenticated;
GRANT ALL ON public.paper_orders TO service_role;
ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders all" ON public.paper_orders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX paper_orders_user_idx ON public.paper_orders(user_id, status);

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_pa_updated BEFORE UPDATE ON public.paper_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pp_updated BEFORE UPDATE ON public.paper_positions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_po_updated BEFORE UPDATE ON public.paper_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
