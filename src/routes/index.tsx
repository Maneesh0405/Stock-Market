import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BookOpen, LineChart, LogOut, Sparkles, TrendingUp, ShieldCheck, Zap, X, Wallet, Trophy } from "lucide-react";
import { useState } from "react";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { AIPanel } from "@/components/dashboard/AIPanel";
import { TradeLog } from "@/components/dashboard/TradeLog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Edgewise · Grow Your Wealth With Smart Trading" },
      {
        name: "description",
        content:
          "ICT-based backtesting, live market signals, and a complete trading course — all in one place.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  return user ? <Dashboard /> : <Landing />;
}

/* ---------------- Landing ---------------- */

function Landing() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Edgewise</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <span>Backtest</span>
            <span>Live Signals</span>
            <span>Course Notes</span>
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Login / Sign up
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-20 text-center">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground">
          <span>NIFTY <span className="text-emerald-500">+0.11%</span></span>
          <span>BANKNIFTY <span className="text-emerald-500">+0.48%</span></span>
          <span>XAUUSD <span className="text-emerald-500">+2.60%</span></span>
        </div>

        <h1 className="mt-6 font-display text-5xl font-bold tracking-tight md:text-7xl">
          Grow your wealth
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Backtest ICT strategies, follow live market signals, and master trading with our complete
          course — built for serious traders.
        </p>

        <button
          onClick={() => setOpen(true)}
          className="mt-8 rounded-full bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
        >
          Get started
        </button>

        <div className="mt-24 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Wallet} title="Paper Trading" desc="Practice with virtual money. Real prices, zero risk. Before you risk real capital." />
          <Feature icon={LineChart} title="Backtest Dashboard" desc="2-year backtest, equity curves, IOF entries, CISD confirmations." />
          <Feature icon={Sparkles} title="Live Signals" desc="Real-time prices for indices, stocks, commodities, forex & crypto." />
          <Feature icon={BookOpen} title="Course Notes" desc="Complete Phase 4 trading course — Lectures 1 to 15." />
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Mini icon={TrendingUp} label="Smart Money Concepts" />
          <Mini icon={ShieldCheck} label="Risk-First Approach" />
          <Mini icon={Zap} label="Daily Bias Updates" />
        </div>
      </main>

      <footer className="py-8 text-center text-sm font-medium text-muted-foreground">
        Done by Maneesh Chowdari
      </footer>

      {open && <AuthModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Mini({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm font-medium">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </div>
  );
}

/* ---------------- Auth Modal ---------------- */

function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) toast.error(error.message ?? "Google sign-in failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Dev Mode Bypass: Simulate a successful login
    setTimeout(() => {
      localStorage.setItem("dev_logged_in", email);
      window.dispatchEvent(new Event("dev_auth_change"));
      setSubmitting(false);
      toast.success(mode === "signin" ? "Signed in (Dev Mode)" : "Account created (Dev Mode)");
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="relative grid w-full max-w-3xl overflow-hidden rounded-2xl bg-card shadow-2xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="hidden flex-col justify-between bg-primary p-8 text-primary-foreground md:flex">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight">
              Simple,<br />Smart<br />Trading.
            </h2>
          </div>
          <div>
            <div className="mb-2 h-1 w-10 bg-primary-foreground" />
            <p className="font-display text-xl font-semibold">Edgewise</p>
          </div>
        </div>

        <div className="p-8">
          <h3 className="font-display text-2xl font-semibold">Welcome to Edgewise</h3>

          {/* <button
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-medium transition hover:bg-accent"
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> Or <div className="h-px flex-1 bg-border" />
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b bg-transparent px-1 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b bg-transparent px-1 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Please wait…" : "Continue"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            By proceeding, I agree to T&C, Privacy Policy & Tariff Rates
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.6l-6-5.1c-2 1.4-4.4 2.2-7 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.1 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6 5.1c-.4.4 6.7-4.9 6.7-14.4 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

/* ---------------- Dashboard (authenticated) ---------------- */

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Edgewise</span>
            <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
              ICT Algo · Backtest Dashboard
            </span>
          </div>
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            <NavLink to="/" active icon={LineChart} label="Backtest" />
            <NavLink to="/paper" icon={Wallet} label="Paper Trading" />
            <NavLink to="/leaderboard" icon={Trophy} label="Leaderboard" />
            <NavLink to="/signals" icon={Sparkles} label="Live Signals" />
            <NavLink to="/notes" icon={BookOpen} label="Course Notes" />
          </nav>
          <div className="flex items-center gap-3">
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-4 px-6 py-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Backtest Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            2-year backtest · Phase 4 trading model (Lectures 1–15)
          </p>
        </div>

        <StatsBar />

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <EquityCurve />
            <PriceChart />
          </div>
          <AIPanel />
        </div>

        <TradeLog />

        <footer className="pt-6 text-center text-xs text-muted-foreground">
          Mock data for demonstration. Wire to FastAPI + WebSockets for live data.
        </footer>
      </main>
    </div>
  );
}

function NavLink({
  icon: Icon,
  label,
  active,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  to: string;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-secondary font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function AuthButton() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[160px] truncate text-xs text-muted-foreground sm:inline">
        {user.email}
      </span>
      <button
        onClick={() => signOut()}
        className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm font-medium transition hover:bg-accent"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );
}

