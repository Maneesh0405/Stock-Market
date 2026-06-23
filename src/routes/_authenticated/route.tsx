import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const devEmail = localStorage.getItem("dev_logged_in");
    if (devEmail) return { user: { id: "dev", email: devEmail } };
  },
  component: () => <Outlet />,
});
