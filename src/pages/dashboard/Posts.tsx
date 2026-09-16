import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS, platformLabel } from "@/lib/platforms";
import { Input } from "@/components/ui/input";
import DraftCard, { Draft } from "@/components/DraftCard";

export default function Posts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setDrafts((data ?? []) as Draft[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return drafts.filter((d) => {
      if (platform !== "all" && d.platform !== platform) return false;
      if (status === "draft" && d.status === "published") return false;
      if (status === "published" && d.status !== "published") return false;
      if (term && !(d.content ?? "").toLowerCase().includes(term)) return false;
      return true;
    });
  }, [drafts, platform, status, search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px] mb-1">Your posts</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Edit, nudge, copy and mark what you've actually posted.
        </p>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your drafts…"
              className="pl-10 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="h-12 px-4 border border-black bg-white text-sm uppercase tracking-wide focus:outline-none"
          >
            <option value="all">All platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-12 px-4 border border-black bg-white text-sm uppercase tracking-wide focus:outline-none"
          >
            <option value="all">All</option>
            <option value="draft">Not posted</option>
            <option value="published">Posted</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="border border-black bg-white p-8 sm:p-12 text-center">
            <h3 className="font-display font-bold text-xl mb-2">No posts here yet</h3>
            <p className="text-muted-foreground mb-6">
               Open a Brain Dump and hit Make posts — drafts land here.
            </p>
            <Link
               to="/dashboard/brain-dumps"
              className="inline-block bg-primary border border-black h-12 px-6 leading-[3rem] rounded-full font-medium shadow-[4px_6px_0px_0px_black]"
            >
               Go to Brain Dumps
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((d) => (
              <div key={d.id} className="space-y-1">
                <DraftCard draft={d} onChanged={load} />
                {d.dump_id && (
                  <Link
                     to={`/dashboard/brain-dumps/${d.dump_id}`}
                    className="text-xs underline text-muted-foreground inline-block"
                  >
                     From this Brain Dump · {platformLabel(d.platform)}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
