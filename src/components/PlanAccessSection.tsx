import { Link } from "react-router-dom";
import { usePlanAccess, refreshAccess } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { formatUTCReset } from "@/lib/planner";

export default function PlanAccessSection() {
  const { access, error } = usePlanAccess();
  return <section className="border-t border-border py-5 space-y-3">
    <h2 className="font-display font-bold text-lg">Plan &amp; access</h2>
    {error ? <Button variant="outline" onClick={refreshAccess}>Retry access check</Button> : !access ? <p>Checking access…</p> : <>
      <p className="font-medium">{access.plan === "Complimentary" ? "Complimentary access" : `${access.plan} access`}</p>
      {access.plan === "Complimentary" && <>
        <p className="text-sm">Full feature access · No subscription payment required</p>
        <p className="text-sm">{access.expires_at ? `Access until ${new Date(access.expires_at).toLocaleString()}` : "No expiry"}</p>
      </>}
      <h3 className="font-medium">Monthly AI usage</h3>
      <p>{access.creations_remaining} / {access.creations} creations remaining</p>
      <p>{access.media_remaining} / {access.media_reads} audio/screenshot reads remaining</p>
      <p className="text-sm text-muted-foreground">One idea extraction, content item or rewrite suggestion uses one creation. Reading an audio file or screenshot uses one separate read. Failed actions cost nothing.</p>
      <p className="text-sm text-muted-foreground">Next reset: {formatUTCReset(access.reset_at)} (UTC calendar month)</p>
      {access.paid && <p className="text-sm text-muted-foreground">Current test allowances; final Paid allowances and price are pending.</p>}
      <p className="text-sm text-muted-foreground">Paid access isn't available to purchase yet.</p>
      {access.admin && <Link className="underline" to="/dashboard/access">Manage complimentary access</Link>}
    </>}
  </section>;
}