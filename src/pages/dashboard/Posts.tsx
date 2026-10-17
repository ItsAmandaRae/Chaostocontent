import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { Filter, Loader2, Search } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS, FORMATS, platformLabel, formatLabel } from "@/lib/platforms";
import { Input } from "@/components/ui/input";
import DraftCard, { Draft } from "@/components/DraftCard";
import BucketChips from "@/components/BucketChips";
import { Bucket, loadBuckets } from "@/lib/buckets";

export default function Posts() {
  const { user } = useOutletContext<{ user: User | null }>();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState("all");
  const [platform, setPlatform] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const openId = searchParams.get("open");

  useEffect(() => {
    if (!openId || loading) return;
    const el = document.getElementById(`post-${openId}`);
    if (el) {
      el.scrollIntoView({ block: "center" });
      el.querySelector("textarea")?.focus();
      setSearchParams({}, { replace: true });
    }
  }, [openId, loading, drafts]);

  const load = async () => {
    const [{ data }, b] = await Promise.all([
      supabase.from("posts").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      loadBuckets().catch(() => [] as Bucket[]),
    ]);
    setDrafts((data ?? []) as Draft[]);
    setBuckets(b);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return drafts.filter((d) => {
      if (d.id === openId) return true;
      if (bucket === "unsorted" && d.bucket_id) return false;
      if (bucket !== "all" && bucket !== "unsorted" && d.bucket_id !== bucket) return false;
      if (platform !== "all" && d.platform !== platform) return false;
      if (format !== "all" && d.variant !== format) return false;
      if (term && !`${d.title ?? ""} ${d.content ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [drafts, bucket, platform, format, search, openId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px] mb-1">Content</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Everything you've made — edits save themselves. Copy it out when you're ready.
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {user && (
            <BucketChips userId={user.id} buckets={buckets} active={bucket} onSelect={setBucket} onChanged={load} />
          )}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your content…"
                className="pl-10 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="h-12 px-4 border border-black bg-white flex items-center gap-2 text-sm uppercase tracking-wide lg:hidden"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="hidden lg:flex gap-3">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-12 px-4 border border-black bg-white text-sm uppercase tracking-wide focus:outline-none"
              >
                <option value="all">All destinations</option>
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="h-12 px-4 border border-black bg-white text-sm uppercase tracking-wide focus:outline-none"
              >
                <option value="all">All formats</option>
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {filtersOpen && (
            <div className="flex flex-col gap-3 lg:hidden">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-12 px-4 border border-black bg-white text-sm uppercase tracking-wide focus:outline-none"
              >
                <option value="all">All destinations</option>
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="h-12 px-4 border border-black bg-white text-sm uppercase tracking-wide focus:outline-none"
              >
                <option value="all">All formats</option>
                {FORMATS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="border border-black bg-white p-8 sm:p-12 text-center">
            <h3 className="font-display font-bold text-xl mb-2">No content here yet</h3>
            <p className="text-muted-foreground mb-6">
              Open a Brain Dump or an idea and hit Make content — it lands here.
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
              <div key={d.id} id={`post-${d.id}`} className="space-y-1">
                <DraftCard draft={d} buckets={buckets} onChanged={load} />
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {d.dump_id && (
                    <Link to={`/dashboard/brain-dumps/${d.dump_id}`} className="underline">
                      From this Brain Dump
                    </Link>
                  )}
                  {d.idea_id && (
                    <Link to="/dashboard/ideas" className="underline">
                      From your Idea Bank
                    </Link>
                  )}
                  <span>
                    {platformLabel(d.platform)} · {formatLabel(d.variant)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
