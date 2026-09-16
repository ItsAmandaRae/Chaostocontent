import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useOutletContext } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Search, Plus, Sparkles, Archive, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import DumpDialog from "@/components/DumpDialog";
import { Dump, KIND_LABELS, processDump } from "@/lib/dumps";

const filters = ["new", "used", "archived", "all"] as const;
const filterLabels: Record<string, string> = {
  new: "New",
  used: "Used",
  archived: "Archived",
  all: "Everything",
};

export default function Ideas() {
  const { user } = useOutletContext<{ user: User | null }>();
  const [dumps, setDumps] = useState<Dump[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("new");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("dumps")
      .select("*")
      .order("created_at", { ascending: false });
    setDumps((data ?? []) as Dump[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  // Keep polling while anything is still being read.
  useEffect(() => {
    const pending = dumps.some((d) => d.processing_state === "processing" || d.processing_state === "pending");
    if (!pending) return;
    const t = window.setInterval(load, 4000);
    return () => window.clearInterval(t);
  }, [dumps]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("dumps").update({ status }).eq("id", id);
    load();
  };

  const retry = async (id: string) => {
    try {
      await processDump(id);
      toast.success("Read it");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Still couldn't read that one.");
    }
    load();
  };

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return dumps.filter((d) => {
      if (filter !== "all" && d.status !== filter) return false;
      if (!term) return true;
      return [d.title, d.summary, d.raw_text, d.tags.join(" ")]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(term));
    });
  }, [dumps, filter, search]);

  const resurface = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return dumps
      .filter((d) => d.status === "new" && new Date(d.created_at).getTime() < weekAgo)
      .slice(0, 3);
  }, [dumps]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px]">Your Brain Dumps</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Everything you've thrown in — voice notes, notes, screenshots, links.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-highlight text-highlight-foreground border border-black h-12 px-6 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Dump it
          </button>
        </div>

        {resurface.length > 0 && (
          <div className="border border-black bg-secondary p-4 mb-6">
            <p className="font-display font-bold text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Don't let these rot
            </p>
            <div className="flex flex-wrap gap-2">
              {resurface.map((d) => (
                <Link
                  key={d.id}
                   to={`/dashboard/brain-dumps/${d.id}`}
                  className="px-3 py-1 border border-black bg-white text-sm hover:bg-primary transition-colors"
                >
                  {d.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search everything, including screenshot text…"
              className="pl-10 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 border border-black text-sm font-medium uppercase tracking-wide whitespace-nowrap transition-colors ${
                  filter === f ? "bg-primary" : "bg-white hover:bg-secondary"
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="border border-black bg-white p-8 sm:p-12 text-center">
            <h3 className="font-display font-bold text-xl mb-2">Nothing here yet</h3>
            <p className="text-muted-foreground mb-6">
              Dump one messy thought. You don't have to finish it.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="bg-primary border border-black h-12 px-6 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
            >
              Dump it
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((d) => (
              <div key={d.id} className="border border-black bg-white p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-1 border border-black bg-secondary text-xs uppercase tracking-wide">
                    {KIND_LABELS[d.kind] ?? d.kind}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>

                 <Link to={`/dashboard/brain-dumps/${d.id}`} className="block">
                  <h3 className="font-display font-bold text-lg leading-snug hover:underline">{d.title}</h3>
                </Link>

                {d.processing_state === "processing" || d.processing_state === "pending" ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Reading it…
                  </p>
                ) : d.processing_state === "error" ? (
                  <div className="text-sm text-destructive space-y-2">
                    <p className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {d.processing_error || "We couldn't read that one."}
                    </p>
                    <button onClick={() => retry(d.id)} className="px-3 py-1 border border-black bg-white text-black text-xs">
                      Try again
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground line-clamp-3">{d.summary || d.raw_text}</p>
                )}

                {d.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {d.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 border border-black text-xs bg-accent">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-2 pt-2">
                  <Link
                     to={`/dashboard/brain-dumps/${d.id}`}
                    className="flex-1 text-center px-3 py-2 border border-black bg-primary text-sm font-medium"
                  >
                    Make posts
                  </Link>
                  <button
                    onClick={() => setStatus(d.id, d.status === "archived" ? "new" : "archived")}
                    title={d.status === "archived" ? "Bring it back" : "Archive"}
                    className="px-3 py-2 border border-black bg-white hover:bg-secondary transition-colors"
                  >
                    {d.status === "archived" ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <DumpDialog open={open} onOpenChange={setOpen} user={user} onSaved={load} />
    </div>
  );
}
