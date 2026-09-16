import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useOutletContext } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DumpDialog from "@/components/DumpDialog";
import { Dump, KIND_LABELS } from "@/lib/dumps";

interface Post {
  id: string;
  status: string;
}

export default function DashboardHome() {
  const { user } = useOutletContext<{ user: User | null }>();
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [completeness, setCompleteness] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const [{ data: dumpData }, { data: postData }, { data: brand }] = await Promise.all([
      supabase.from("dumps").select("*").order("created_at", { ascending: false }),
      supabase.from("posts").select("id, status"),
      supabase.from("brand_profiles").select("what_you_do, audience, tone_traits, voice_samples").maybeSingle(),
    ]);
    setDumps((dumpData ?? []) as Dump[]);
    setPosts((postData ?? []) as Post[]);
    if (brand) {
      const done = [
        brand.what_you_do,
        brand.audience,
        brand.tone_traits?.length ? "y" : "",
        brand.voice_samples?.length ? "y" : "",
      ].filter(Boolean).length;
      setCompleteness(Math.round((done / 4) * 100));
    } else {
      setCompleteness(0);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const stats = [
    { value: dumps.length.toString(), label: "Brain Dumps" },
    { value: dumps.filter((d) => d.status === "new").length.toString(), label: "Waiting to use" },
    { value: posts.length.toString(), label: "Drafts written" },
    { value: posts.filter((p) => p.status === "published").length.toString(), label: "Posted" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px]">
              What's in your head today?
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dump it here. We'll turn it into posts that sound like you.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-highlight text-highlight-foreground border border-black h-12 px-6 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Dump it
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 bg-black">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white border border-black ${index >= 2 ? "-mt-[1px] lg:mt-0" : ""} ${
                index % 2 === 1 ? "-ml-[1px]" : ""
              } ${index > 0 ? "lg:-ml-[1px]" : ""} flex flex-col gap-2 items-start px-4 sm:px-6 py-4 sm:py-6`}
            >
              <p className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-[-0.96px]">
                {stat.value}
              </p>
              <p className="text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>

        {completeness !== null && completeness < 100 && (
          <Link
            to="/dashboard/brand"
            className="block border border-black bg-secondary p-4 mt-6 hover:bg-primary transition-colors"
          >
            <p className="font-display font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Your Brand DNA is {completeness}% filled in
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              The more we know about your voice, the less your drafts sound like a robot.
            </p>
          </Link>
        )}

        <div className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display font-black text-xl sm:text-2xl tracking-[-0.5px]">Latest ideas</h2>
             <Link to="/dashboard/brain-dumps" className="text-sm underline uppercase tracking-wide">
              See all
            </Link>
          </div>

          {dumps.length === 0 ? (
            <div className="border border-black bg-white p-8 sm:p-12 text-center">
              <h3 className="font-display font-bold text-xl mb-2">Nothing caught yet</h3>
              <p className="text-muted-foreground mb-6">
                A voice note, a screenshot, half a sentence — anything counts.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="bg-primary border border-black h-12 px-6 rounded-full font-medium shadow-[4px_6px_0px_0px_black]"
              >
                Dump your first idea
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {dumps.slice(0, 6).map((d) => (
                <Link
                  key={d.id}
                   to={`/dashboard/brain-dumps/${d.id}`}
                  className="border border-black bg-white p-4 hover:bg-secondary transition-colors"
                >
                  <span className="px-2 py-1 border border-black bg-secondary text-xs uppercase tracking-wide">
                    {KIND_LABELS[d.kind] ?? d.kind}
                  </span>
                  <h3 className="font-display font-bold text-lg mt-2 leading-snug">{d.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{d.summary || d.raw_text}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <DumpDialog open={open} onOpenChange={setOpen} user={user} onSaved={load} />
    </div>
  );
}
