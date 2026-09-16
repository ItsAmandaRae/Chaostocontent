import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles, Archive, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS } from "@/lib/platforms";
import { Dump, KIND_LABELS, dumpFileUrl, generatePosts, processDump } from "@/lib/dumps";
import { Input } from "@/components/ui/input";
import DraftCard, { Draft } from "@/components/DraftCard";

export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dump, setDump] = useState<Dump | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>(["twitter", "instagram"]);
  const [notes, setNotes] = useState("");
  const [making, setMaking] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    const [{ data: d }, { data: p }] = await Promise.all([
      supabase.from("dumps").select("*").eq("id", id).maybeSingle(),
      supabase.from("posts").select("*").eq("dump_id", id).order("created_at", { ascending: false }),
    ]);
    setDump((d as Dump) ?? null);
    setDrafts((p ?? []) as Draft[]);
    setLoading(false);
    if (d?.file_path) setMediaUrl(await dumpFileUrl(d.kind, d.file_path));
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (!dump) return;
    if (dump.processing_state !== "processing" && dump.processing_state !== "pending") return;
    const t = window.setInterval(load, 4000);
    return () => window.clearInterval(t);
  }, [dump?.processing_state]);

  useEffect(() => {
    // Pre-select the platforms from Brand DNA, if any.
    supabase
      .from("brand_profiles")
      .select("platforms")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.platforms?.length) setSelected(data.platforms.slice(0, 8));
      });
  }, []);

  const toggle = (pid: string) =>
    setSelected((prev) => (prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]));

  const make = async () => {
    if (!id) return;
    if (selected.length === 0) return toast.error("Pick at least one platform.");
    setMaking(true);
    try {
      await generatePosts([id], selected, notes);
      toast.success("Drafts are ready");
      setNotes("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't write the drafts.");
    } finally {
      setMaking(false);
    }
  };

  const setStatus = async (status: string) => {
    if (!id) return;
    await supabase.from("dumps").update({ status }).eq("id", id);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!dump) {
    return (
      <div className="p-8">
         <p className="font-display font-bold text-xl mb-4">That Brain Dump isn't here anymore.</p>
         <button onClick={() => navigate("/dashboard/brain-dumps")} className="px-4 py-2 border border-black bg-primary">
           Back to Brain Dumps
        </button>
      </div>
    );
  }

  const reading = dump.processing_state === "processing" || dump.processing_state === "pending";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
           onClick={() => navigate("/dashboard/brain-dumps")}
          className="flex items-center gap-2 text-sm uppercase tracking-wide mb-4 hover:underline"
        >
           <ArrowLeft className="w-4 h-4" /> All Brain Dumps
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2 py-1 border border-black bg-secondary text-xs uppercase tracking-wide">
            {KIND_LABELS[dump.kind] ?? dump.kind}
          </span>
          {dump.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 border border-black text-xs bg-accent">
              {t}
            </span>
          ))}
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px] mb-4">{dump.title}</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border border-black bg-white p-4 space-y-3">
              {reading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Reading it — this takes a moment.
                </p>
              ) : dump.processing_state === "error" ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{dump.processing_error || "We couldn't read that one."}</p>
                  <button
                    onClick={() =>
                      processDump(dump.id)
                        .then(load)
                        .catch((e) => toast.error(e instanceof Error ? e.message : "Still no luck."))
                    }
                    className="px-3 py-2 border border-black bg-white text-sm"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  {dump.summary && <p className="text-sm font-medium">{dump.summary}</p>}
                  {dump.link_url && (
                    <a
                      href={dump.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline break-all"
                    >
                      {dump.link_url}
                    </a>
                  )}
                  {mediaUrl && dump.kind === "audio" && (
                    <audio controls src={mediaUrl} className="w-full" />
                  )}
                  {mediaUrl && dump.kind === "image" && (
                    <img src={mediaUrl} alt={dump.title} className="w-full border border-black" />
                  )}
                  {dump.raw_text && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dump.raw_text}</p>
                  )}
                </>
              )}
            </div>

            <div className="border border-black bg-white p-4 space-y-3">
              <h2 className="font-display font-bold text-lg">Make posts</h2>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`text-left px-3 py-2 border border-black text-sm transition-colors ${
                      selected.includes(p.id) ? "bg-primary" : "bg-white hover:bg-secondary"
                    }`}
                  >
                    <span className="font-medium block">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.hint}</span>
                  </button>
                ))}
              </div>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any direction? e.g. lead with the mistake I made"
                className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-11"
              />
              <button
                onClick={make}
                disabled={making || reading}
                className="w-full bg-highlight text-highlight-foreground border border-black h-12 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {making ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {making ? "Writing in your voice…" : "Make posts"}
              </button>
              <button
                onClick={() => setStatus(dump.status === "archived" ? "new" : "archived")}
                className="w-full px-4 py-2 border border-black bg-white text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
              >
                {dump.status === "archived" ? (
                  <>
                    <RotateCcw className="w-4 h-4" /> Bring it back
                  </>
                ) : (
                  <>
                     <Archive className="w-4 h-4" /> Archive this Brain Dump
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg">
              Drafts {drafts.length > 0 && <span className="text-muted-foreground">({drafts.length})</span>}
            </h2>
            {drafts.length === 0 ? (
              <div className="border border-black bg-white p-6 text-sm text-muted-foreground">
                No drafts yet. Pick your platforms and hit Make posts.
              </div>
            ) : (
              drafts.map((d) => <DraftCard key={d.id} draft={d} onChanged={load} />)
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
