import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles, Archive, RotateCcw, Lightbulb, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dump, KIND_LABELS, dumpFileUrl, extractIdeas, ExtractedIdea, processDump } from "@/lib/dumps";
import DraftCard, { Draft } from "@/components/DraftCard";
import MakeContentDialog from "@/components/MakeContentDialog";
import { Bucket, loadBuckets } from "@/lib/buckets";

export default function IdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dump, setDump] = useState<Dump | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [makeOpen, setMakeOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<ExtractedIdea[] | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  const [dismissedIdx, setDismissedIdx] = useState<Set<number>>(new Set());
  const savingRef = useRef<Set<number>>(new Set());

  const load = async () => {
    if (!id) return;
    const [{ data: d }, { data: p }, b] = await Promise.all([
      supabase.from("dumps").select("*").eq("id", id).maybeSingle(),
      supabase.from("posts").select("*").eq("dump_id", id).is("deleted_at", null).order("created_at", { ascending: false }),
      loadBuckets().catch(() => [] as Bucket[]),
    ]);
    setDump((d as Dump) ?? null);
    setDrafts((p ?? []) as Draft[]);
    setBuckets(b);
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

  const readable =
    !!dump &&
    dump.processing_state !== "processing" &&
    dump.processing_state !== "pending" &&
    dump.processing_state !== "error" &&
    !!(dump.raw_text?.trim() || dump.summary?.trim());

  const pullIdeas = async () => {
    if (!id || extracting) return;
    setExtracting(true);
    setExtractError(null);
    setSuggestions(null);
    setSavedIdx(new Set());
    setDismissedIdx(new Set());
    try {
      const ideas = await extractIdeas(id);
      setSuggestions(ideas);
      if (!ideas.length) setExtractError("No clear ideas came back — try again.");
    } catch (e) {
      setExtractError(e instanceof Error ? e.message : "Couldn't pull out ideas.");
    } finally {
      setExtracting(false);
    }
  };

  const saveSuggestion = async (idx: number) => {
    if (!id || !suggestions || savingRef.current.has(idx) || savedIdx.has(idx)) return;
    savingRef.current.add(idx);
    const s = suggestions[idx];
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      savingRef.current.delete(idx);
      return toast.error("Sign in again to save ideas.");
    }
    const { error } = await supabase.from("ideas").insert({
      user_id: auth.user.id,
      dump_id: id,
      title: s.title,
      angle: s.angle || null,
      source_excerpt: s.excerpt || null,
    });
    savingRef.current.delete(idx);
    if (error) return toast.error("Couldn't save that idea — try again.");
    setSavedIdx((prev) => new Set(prev).add(idx));
  };

  const saveAll = async () => {
    if (!suggestions) return;
    for (let i = 0; i < suggestions.length; i++) {
      if (!dismissedIdx.has(i)) await saveSuggestion(i);
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
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your original — always kept as-is</p>
              {reading ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Reading it — this takes a moment.
                </p>
              ) : dump.processing_state === "error" ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{dump.processing_error || "We couldn't read that one."}</p>
                  <p className="text-sm text-muted-foreground">Your original file is safe — you can try reading it again.</p>
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
                    <a href={dump.link_url} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all">
                      {dump.link_url}
                    </a>
                  )}
                  {mediaUrl && dump.kind === "audio" && <audio controls src={mediaUrl} className="w-full" />}
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
              <h2 className="font-display font-bold text-lg">What next?</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  onClick={pullIdeas}
                  disabled={!readable || extracting}
                  className="px-4 py-3 border border-black bg-white text-left hover:bg-secondary transition-colors disabled:opacity-50"
                >
                  <span className="font-medium flex items-center gap-2">
                    {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                    Pull out ideas
                  </span>
                  <span className="text-xs text-muted-foreground">Save the golden nuggets to your Idea Bank</span>
                </button>
                <button
                  onClick={() => setMakeOpen(true)}
                  disabled={!readable}
                  className="px-4 py-3 border border-black bg-highlight text-highlight-foreground text-left font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Make content
                  </span>
                  <span className="text-xs">One piece, in your voice</span>
                </button>
              </div>
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

            {extractError && (
              <div className="border border-black bg-white p-4 space-y-2">
                <p className="text-sm text-destructive">{extractError}</p>
                <button onClick={pullIdeas} className="px-3 py-2 border border-black bg-white text-sm">
                  Try again
                </button>
              </div>
            )}

            {suggestions && (
              <div className="border border-black bg-white p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display font-bold text-lg">Ideas we found</h2>
                  <button onClick={saveAll} className="px-3 py-1.5 border border-black bg-primary text-sm font-medium">
                    Save all
                  </button>
                </div>
                {suggestions.map((s, idx) =>
                  dismissedIdx.has(idx) ? null : (
                    <div key={idx} className="border border-black p-3 space-y-1">
                      <input
                        value={s.title}
                        onChange={(e) =>
                          setSuggestions((prev) =>
                            prev ? prev.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) : prev,
                          )
                        }
                        aria-label="Idea title"
                        className="w-full font-medium text-sm border border-black px-2 py-1 bg-white focus:outline-none focus:border-2"
                      />
                      <input
                        value={s.angle}
                        onChange={(e) =>
                          setSuggestions((prev) =>
                            prev ? prev.map((x, i) => (i === idx ? { ...x, angle: e.target.value } : x)) : prev,
                          )
                        }
                        placeholder="Angle (optional)"
                        aria-label="Idea angle"
                        className="w-full text-sm text-muted-foreground border border-black px-2 py-1 bg-white focus:outline-none focus:border-2"
                      />
                      {s.excerpt && (
                        <blockquote className="border-l-2 border-black pl-2 text-xs text-muted-foreground italic">
                          "{s.excerpt}"
                        </blockquote>
                      )}
                      <div className="flex gap-2 pt-1">
                        {savedIdx.has(idx) ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="w-3.5 h-3.5" /> Saved to Idea Bank
                          </span>
                        ) : (
                          <button
                            onClick={() => saveSuggestion(idx)}
                            className="px-3 py-1 border border-black bg-accent text-xs font-medium"
                          >
                            Save idea
                          </button>
                        )}
                        <button
                          onClick={() => setDismissedIdx((prev) => new Set(prev).add(idx))}
                          aria-label="Dismiss suggestion"
                          className="px-2 py-1 border border-black bg-white text-xs hover:bg-secondary"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg">
              Content from this dump {drafts.length > 0 && <span className="text-muted-foreground">({drafts.length})</span>}
            </h2>
            {drafts.length === 0 ? (
              <div className="border border-black bg-white p-6 text-sm text-muted-foreground">
                Nothing made from this one yet. Hit "Make content" when you're ready.
              </div>
            ) : (
              drafts.map((d) => <DraftCard key={d.id} draft={d} buckets={buckets} onChanged={load} />)
            )}
          </div>
        </div>

        <MakeContentDialog
          open={makeOpen}
          onOpenChange={setMakeOpen}
          dumpIds={[dump.id]}
          suggestReference={dump.kind === "image" || dump.kind === "link"}
          onCreated={() => {
            setMakeOpen(false);
            load();
          }}
        />
      </motion.div>
    </div>
  );
}
