import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const plans = [
    { name: "Free", features: ["5 AI creations per calendar month", "5 audio or screenshot reads per month", "3 custom buckets · optional Brand DNA", "All content formats within your allowance", "Save notes and manual ideas; edit and copy existing content" ] },
    { name: "Paid · coming soon", features: ["Full visual planner", "Unlimited custom buckets", "All formats and Brand DNA", "Finite AI allowance · final amount pending", "Price and purchase setup still pending"] },
  ];
  return <section id="pricing" className="py-16 lg:py-24 px-6">
    <div className="container mx-auto max-w-5xl space-y-10">
      <h2 className="font-display font-bold text-4xl text-center">Simple plans</h2>
      <div className="grid md:grid-cols-2 gap-6">{plans.map((plan, i) => <article key={plan.name} className={`border border-border p-6 sm:p-8 space-y-6 ${i ? "bg-primary" : "bg-background"}`}>
        <h3 className="font-display font-bold text-2xl">{plan.name}</h3>
        <ul className="space-y-3">{plan.features.map(f => <li key={f} className="flex gap-2 text-sm"><Check className="w-4 h-4 shrink-0 mt-1" />{f}</li>)}</ul>
        {i ? <p className="text-sm">Paid access isn't available to purchase yet.</p> : <Button asChild variant="outline"><Link to="/auth">Start Free</Link></Button>}
      </article>)}</div>
      <p className="text-sm text-muted-foreground text-center">One creation = pulling out ideas, making one content item, or a rewrite suggestion. Failed AI actions cost nothing.</p>
    </div>
  </section>;
}