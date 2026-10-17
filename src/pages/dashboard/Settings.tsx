import PlanAccessSection from "@/components/PlanAccessSection";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link, useOutletContext } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { User as UserIcon, Lock, Sliders, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { displayNameSchema } from "@/lib/validation";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  default_tone: string | null;
  auto_publish: boolean | null;
}



export default function Settings() {
  const { user } = useOutletContext<{ user: User | null }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [voiceTraits, setVoiceTraits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (error && error.code !== "PGRST116") {
      toast.error("Failed to load profile");
    }
    if (data) {
      setProfile(data as Profile);
      setDisplayName(data.display_name || "");

    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      supabase.from("brand_profiles").select("tone_traits").eq("user_id", user.id).maybeSingle().then(({ data }) => setVoiceTraits(data?.tone_traits ?? []));
    }
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const parsedName = displayNameSchema.safeParse(displayName);
    if (!parsedName.success) {
      toast.error(parsedName.error.issues[0].message);
      return;
    }
    setSaving(true);

    const payload = {
      user_id: user.id,
      display_name: parsedName.data || null,
    };

    const { error } = profile
      ? await supabase.from("profiles").update(payload).eq("id", profile.id).eq("user_id", user.id)
      : await supabase.from("profiles").insert(payload);

    setSaving(false);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved");
      fetchProfile();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground mb-6 sm:mb-8">
          Settings
        </h1>

        {loading ? (
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
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
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium uppercase tracking-wide mb-2">Email</label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="border border-black rounded-none h-12 bg-muted"
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-border py-5 space-y-3">
              <h2 className="font-display font-bold text-lg">Your voice</h2>
              <p className="text-sm">{voiceTraits.length ? voiceTraits.join(" · ") : "Your voice is yours to define."}</p>
              <Button variant="outline" asChild><Link to="/dashboard/brand">Edit Brand DNA</Link></Button>
            </section>

            <section className="border border-black bg-white p-5">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Account
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" disabled>Password reset unavailable</Button>
                <button
                  onClick={() => toast.info("Account deletion is not available yet")}
                  className="px-4 py-2 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors font-medium"
                >
                  Delete Account
                </button>
              </div>
            </section>

            <PlanAccessSection />

            <div className="flex justify-end">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-8 py-3 border border-black bg-primary font-display font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
