import { useState } from "react";
import { usePlanAccess } from "@/lib/access";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanAccess } from "@/lib/access";

interface Account { user: { id: string; email: string }; access: PlanAccess; grants: { id: string; created_by: string; created_at: string; expires_at: string | null; revoked_at: string | null }[]; audit: { id: string; actor_id: string; action: string; created_at: string }[] }
export default function AccessAdmin() {
  const { access } = usePlanAccess();
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [duration, setDuration] = useState("30");
  const [expiry, setExpiry] = useState("");
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (action: "lookup" | "grant" | "revoke") => {
    setBusy(true); setError("");
    try {
      const expiresAt = action !== "grant" || duration === "none" ? null : duration === "30" ? new Date(Date.now() + 30 * 86400000).toISOString() : new Date(expiry).toISOString();
      const { data, error: failure } = await supabase.functions.invoke("admin-access", { body: action === "lookup" ? { action, query: query.trim() } : { action, userId: account?.user.id, expiresAt, acknowledgeBilling: ack } });
      if (failure || data?.error) throw new Error(data?.error || "Couldn't update access. Check the account and try again.");
      setAccount(data); if (action === "lookup") setAck(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't update access."); }
    finally { setBusy(false); }
  };
  if (!access) return <div className="p-6">Checking access…</div>;
  if (!access.admin) return <div className="p-6">Owner access required.</div>;
  return <div className="p-4 sm:p-8 max-w-3xl space-y-6">
    <h1 className="font-display text-3xl font-bold">Complimentary access</h1>
    <p className="text-sm text-muted-foreground">Paid price and final AI allowances are pending. Gifts use internal testing limits, not unlimited AI.</p>
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); void submit("lookup"); }}>
      <Input aria-label="Exact email or user ID" placeholder="Exact email or user ID" value={query} onChange={e => setQuery(e.target.value)} />
      <Button disabled={busy || !query.trim()}>Find account</Button>
    </form>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {account && <div className="space-y-4 border-t border-border pt-4">
      <p className="font-medium break-all">{account.user.email} · {account.access.plan}</p>
      <p className="text-sm break-all">{account.user.id}</p>
      <label className="block">Paid complimentary access
        <select className="block border border-input bg-background p-2 mt-2" value={duration} onChange={e => setDuration(e.target.value)}>
          <option value="30">30 days</option><option value="expiry">Choose expiry</option><option value="none">No expiry</option>
        </select>
      </label>
      {duration === "expiry" && <Input aria-label="Expiry" type="datetime-local" value={expiry} onChange={e => setExpiry(e.target.value)} />}
      {account.access.billing_active && <label className="flex gap-2 items-start"><input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} />This account has active billing. I understand gifting does not cancel or change their subscription.</label>}
      <div className="flex gap-3"><Button disabled={busy || (account.access.billing_active && !ack) || (duration === "expiry" && !expiry)} onClick={() => void submit("grant")}>Grant Paid access</Button><Button variant="outline" disabled={busy} onClick={() => void submit("revoke")}>Revoke gifts</Button></div>
      <h2 className="font-display font-bold">Grants</h2>
      {account.grants.map(g => <p className="text-sm break-all" key={g.id}>{g.revoked_at ? "Revoked" : g.expires_at && new Date(g.expires_at) <= new Date() ? "Expired" : "Active"} · {g.expires_at ? new Date(g.expires_at).toLocaleString() : "No expiry"} · by {g.created_by}</p>)}
      <h2 className="font-display font-bold">Audit history</h2>
      {account.audit.map(a => <p className="text-sm break-all" key={a.id}>{a.action} · {new Date(a.created_at).toLocaleString()} · by {a.actor_id}</p>)}
    </div>}
  </div>;
}