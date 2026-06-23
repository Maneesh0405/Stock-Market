import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const [devEmail, setDevEmail] = useState(typeof window !== "undefined" ? localStorage.getItem("dev_logged_in") : null);

  useEffect(() => {
    const handleAuth = () => setDevEmail(localStorage.getItem("dev_logged_in"));
    window.addEventListener("dev_auth_change", handleAuth);
    return () => window.removeEventListener("dev_auth_change", handleAuth);
  }, []);

  const signOut = async () => {
    localStorage.removeItem("dev_logged_in");
    window.dispatchEvent(new Event("dev_auth_change"));
    await supabase.auth.signOut();
  };

  const mockUser = devEmail ? ({ id: "dev", email: devEmail } as User) : null;

  return (
    <AuthContext.Provider value={{ user: session?.user ?? mockUser, session, loading: false, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
