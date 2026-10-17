import { Link } from "react-router-dom";
import { usePlanAccess, refreshAccess } from "@/lib/access";
import { Button } from "@/components/ui/button";

export default function PlanAccessSection() {
  const { access, error } = usePlanAccess();
  return <section className="border-t border-border py-5 space-y-3">
    <h2 className="font-display font-bold text-lg">Plan &amp; access</h2>
    {error ? <Button variant="outline" onClick={refreshAccess}>Retry access check</Button> : !access ? <p>Checking access…</p> : <>
      <p className="font-medium">{access.plan}</p>
      <p>{access.creations_remaining} creations remaining · {access.media_remaining} audio/screenshot reads remaining</p>
      <p className="text-sm text-muted-foreground">Resets {new Date(access.reset_at).toLocaleDateString()} (UTC calendar month)</p>
      {access.plan === "Complimentary" && <p className="text-sm">{access.expires_at ? `Complimentary until ${new Date(access.expires_at).toLocaleString()}` : "Complimentary access · no expiry"}</p>}
      {access.paid && <p className="text-sm text-muted-foreground">Internal testing allowances apply. Final Paid allowance and price are pending.</p>}
      <p className="text-sm text-muted-foreground">Paid access isn't available to purchase yet.</p>
      {access.admin && <Link className="underline" to="/dashboard/access">Manage complimentary access</Link>}
    </>}
  </section>;
}