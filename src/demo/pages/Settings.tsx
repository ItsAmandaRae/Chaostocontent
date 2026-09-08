import { motion } from "framer-motion";
import { toast } from "sonner";
import { User as UserIcon, Lock, Sliders, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSeedData } from "../SeedDataProvider";

const tones = ["casual", "professional", "witty", "inspirational"];

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

          <section className="border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium uppercase tracking-wide mb-2">Default Tone</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((t) => (
                    <button
                      key={t}
                      onClick={() => setProfile({ ...profile, default_tone: t })}
                      className={`px-4 py-2 border border-black text-sm font-medium capitalize transition-colors ${
                        profile.default_tone === t ? "bg-primary" : "bg-white hover:bg-secondary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="demo-auto-publish"
                  type="checkbox"
                  checked={profile.auto_publish}
                  onChange={(e) => setProfile({ ...profile, auto_publish: e.target.checked })}
                  className="w-5 h-5 border border-black rounded-none accent-primary"
                />
                <label htmlFor="demo-auto-publish" className="text-sm font-medium uppercase tracking-wide">
                  Auto-publish ready posts to default channel
                </label>
              </div>
            </div>
          </section>

          <section className="border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Account
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => toast.info("Account actions are disabled in the demo")}
                className="px-4 py-2 border border-black bg-white hover:bg-secondary transition-colors font-medium"
              >
                Reset Password
              </button>
              <button
                onClick={() => toast.info("Account actions are disabled in the demo")}
                className="px-4 py-2 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </section>

          <section className="border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold">Free Plan</p>
                <p className="text-sm text-muted-foreground">5 recordings / 10 posts per month</p>
              </div>
              <button
                onClick={() => toast.info("Billing upgrade coming soon")}
                className="px-6 py-2 border border-black bg-highlight text-highlight-foreground font-medium hover:bg-white hover:text-black transition-colors"
              >
                Upgrade
              </button>
            </div>
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
