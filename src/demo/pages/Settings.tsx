import { motion } from "framer-motion";
import { toast } from "sonner";
import { User as UserIcon, Lock, Sliders, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSeedData } from "../SeedDataProvider";



export default function DemoSettings() {
  const { profile, setProfile } = useSeedData();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground mb-6 sm:mb-8">
          Settings
        </h1>

        <div className="space-y-6">
          <section className="border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium uppercase tracking-wide mb-2">Display Name</label>
                <Input
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium uppercase tracking-wide mb-2">Email</label>
                <Input value={profile.email} disabled className="border border-black rounded-none h-12 bg-muted" />
              </div>
            </div>
          </section>

          <section className="border-t border-border py-5 space-y-2">
            <h2 className="font-display font-bold text-lg">Your voice · sample</h2>
            <p className="text-sm">Warm · candid · story-led</p>
            <p className="text-sm text-muted-foreground">Your traits, writing samples and words to avoid belong together in Brand DNA.</p>
          </section>

          <section className="border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Account
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" disabled>Password reset unavailable in demo</Button>
              <button
                onClick={() => toast.info("Account actions are disabled in the demo")}
                className="px-4 py-2 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </section>

          <section className="border-t border-border py-5 space-y-2">
            <h2 className="font-display font-bold text-lg">Plan &amp; access · sample</h2>
            <p>Free includes 5 creations and 5 media reads per month.</p>
            <p className="text-sm text-muted-foreground">Paid access isn't available to purchase yet. This demo does not spend an allowance.</p>
          </section>

          <div className="flex justify-end">
            <button
              onClick={() => toast.success("Saved for this demo session only")}
              className="px-8 py-3 border border-black bg-primary font-display font-bold hover:bg-primary/80 rounded-full shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out"
            >
              Save Settings
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
