import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS } from "@/lib/platforms";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TONE_TRAITS = [
  "warm", "blunt", "funny", "calm", "hype", "nerdy", "tender",
  "no-nonsense", "story-led", "swears a bit", "encouraging", "contrarian",
];

interface Form {
  what_you_do: string;
  audience: string;
  audience_problem: string;
  offers: string;
  links: string;
  cta_style: string;
  tone_traits: string[];
  banned_words: string[];
  voice_samples: string[];
  platforms: string[];
}

const empty: Form = {
  what_you_do: "",
  audience: "",
  audience_problem: "",
  offers: "",
  links: "",
  cta_style: "",
  tone_traits: [],
  banned_words: [],
  voice_samples: [""],
  platforms: ["twitter", "instagram"],
};

export default function BrandDNA() {
  const { user } = useOutletContext<{ user: User | null }>();
  const [form, setForm] = useState<Form>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannedInput, setBannedInput] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            what_you_do: data.what_you_do ?? "",
            audience: data.audience ?? "",
            audience_problem: data.audience_problem ?? "",
            offers: data.offers ?? "",
            links: data.links ?? "",
            cta_style: data.cta_style ?? "",
            tone_traits: data.tone_traits ?? [],
            banned_words: data.banned_words ?? [],
            voice_samples: data.voice_samples?.length ? data.voice_samples : [""],
            platforms: data.platforms?.length ? data.platforms : empty.platforms,
          });
        }
        setLoading(false);
      });
  }, [user]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleIn = (key: "tone_traits" | "platforms", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const filled = [
    form.what_you_do,
    form.audience,
    form.audience_problem,
    form.tone_traits.length ? "y" : "",
    form.voice_samples.filter((s) => s.trim()).length ? "y" : "",
    form.offers,
    form.cta_style,
    form.platforms.length ? "y" : "",
  ].filter((v) => v && v.toString().trim()).length;
  const completeness = Math.round((filled / 8) * 100);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("brand_profiles").upsert(
      {
        user_id: user.id,
        what_you_do: form.what_you_do.trim() || null,
        audience: form.audience.trim() || null,
        audience_problem: form.audience_problem.trim() || null,
        offers: form.offers.trim() || null,
        links: form.links.trim() || null,
        cta_style: form.cta_style.trim() || null,
        tone_traits: form.tone_traits,
        banned_words: form.banned_words,
        voice_samples: form.voice_samples.map((s) => s.trim()).filter(Boolean),
        platforms: form.platforms,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) return toast.error("Couldn't save that.");
    toast.success("Saved — your drafts just got better");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const field =
    "border border-black rounded-none focus-visible:ring-0 focus-visible:border-black";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px] mb-1">Your Brand DNA</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Fill in what you can. Nothing here is required, and you can add more any time.
        </p>

        <div className="border border-black bg-white p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium uppercase tracking-wide">How well we know your voice</span>
            <span>{completeness}%</span>
          </div>
          <div className="h-3 border border-black bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${completeness}%` }} />
          </div>
        </div>

        <div className="space-y-6">
          <section className="border border-black bg-white p-4 space-y-3">
            <h2 className="font-display font-bold text-lg">You</h2>
            <Textarea
              value={form.what_you_do}
              onChange={(e) => set("what_you_do", e.target.value)}
              placeholder="What do you do, in your own words?"
              className={field}
            />
            <Textarea
              value={form.audience}
              onChange={(e) => set("audience", e.target.value)}
              placeholder="Who are you talking to?"
              className={field}
            />
            <Textarea
              value={form.audience_problem}
              onChange={(e) => set("audience_problem", e.target.value)}
              placeholder="What are they stuck on?"
              className={field}
            />
          </section>

          <section className="border border-black bg-white p-4 space-y-4">
            <h2 className="font-display font-bold text-lg">Your voice</h2>
            <div className="flex flex-wrap gap-2">
              {TONE_TRAITS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleIn("tone_traits", t)}
                  className={`px-3 py-1 border border-black text-sm transition-colors ${
                    form.tone_traits.includes(t) ? "bg-primary" : "bg-white hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide">
                Paste 2-3 things you wrote that sound like you
              </p>
              {form.voice_samples.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    value={s}
                    onChange={(e) =>
                      set(
                        "voice_samples",
                        form.voice_samples.map((v, j) => (j === i ? e.target.value : v)),
                      )
                    }
                    placeholder="Paste a post, caption or email…"
                    className={field}
                  />
                  {form.voice_samples.length > 1 && (
                    <button
                      onClick={() =>
                        set("voice_samples", form.voice_samples.filter((_, j) => j !== i))
                      }
                      className="px-3 border border-black bg-white hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {form.voice_samples.length < 5 && (
                <button
                  onClick={() => set("voice_samples", [...form.voice_samples, ""])}
                  className="px-3 py-2 border border-black bg-white text-sm flex items-center gap-2 hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add another
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide">Words you'd never say</p>
              <div className="flex gap-2">
                <Input
                  value={bannedInput}
                  onChange={(e) => setBannedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && bannedInput.trim()) {
                      e.preventDefault();
                      set("banned_words", [...form.banned_words, bannedInput.trim()]);
                      setBannedInput("");
                    }
                  }}
                  placeholder="e.g. game-changer, unlock, dive in"
                  className={`${field} h-11`}
                />
                <button
                  onClick={() => {
                    if (!bannedInput.trim()) return;
                    set("banned_words", [...form.banned_words, bannedInput.trim()]);
                    setBannedInput("");
                  }}
                  className="px-4 border border-black bg-accent text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.banned_words.map((w, i) => (
                  <button
                    key={`${w}-${i}`}
                    onClick={() => set("banned_words", form.banned_words.filter((_, j) => j !== i))}
                    className="px-2 py-1 border border-black bg-secondary text-xs flex items-center gap-1"
                  >
                    {w} <Trash2 className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="border border-black bg-white p-4 space-y-3">
            <h2 className="font-display font-bold text-lg">Offers and asks</h2>
            <Textarea
              value={form.offers}
              onChange={(e) => set("offers", e.target.value)}
              placeholder="What do you sell or want people to do?"
              className={field}
            />
            <Input
              value={form.links}
              onChange={(e) => set("links", e.target.value)}
              placeholder="Links you share most"
              className={`${field} h-11`}
            />
            <Input
              value={form.cta_style}
              onChange={(e) => set("cta_style", e.target.value)}
              placeholder="How you like to ask, e.g. soft, no pressure"
              className={`${field} h-11`}
            />
          </section>

          <section className="border border-black bg-white p-4 space-y-3">
            <h2 className="font-display font-bold text-lg">Where you post</h2>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleIn("platforms", p.id)}
                  className={`px-3 py-2 border border-black text-sm transition-colors ${
                    form.platforms.includes(p.id) ? "bg-primary" : "bg-white hover:bg-secondary"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={save}
            disabled={saving}
            className="bg-highlight text-highlight-foreground border border-black h-12 px-8 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save my Brand DNA"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
