import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlanAccess {
  plan: "Free" | "Paid" | "Complimentary";
  paid: boolean;
  admin: boolean;
  billing_active: boolean;
  creations_remaining: number;
  media_remaining: number;
  creations: number;
  media_reads: number;
  reset_at: string;
  expires_at: string | null;
}
export function refreshAccess() { window.dispatchEvent(new Event("ctc-access-changed")); }
export function usePlanAccess() {
  const [access, setAccess] = useState<PlanAccess | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error: failure } = await supabase.rpc("my_access");
      if (active) { setError(!!failure); setAccess(failure ? null : data as unknown as PlanAccess); }
    };
    void load();
    const { data: auth } = supabase.auth.onAuthStateChange(() => { setAccess(null); void load(); });
    window.addEventListener("ctc-access-changed", load);
    return () => { active = false; auth.subscription.unsubscribe(); window.removeEventListener("ctc-access-changed", load); };
  }, []);
  return { access, error };
}