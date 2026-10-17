import { persistedDrafts } from "@/lib/persistedDrafts";
import AllowanceNote from "@/components/AllowanceNote";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, RefreshCw, Trash2, CheckCircle2, CalendarPlus, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { platformById, platformLabel, formatLabel, formatById } from "@/lib/platforms";
import { shareTo, shareVerb } from "@/lib/share";
import { regeneratePost, regenerateFromSource } from "@/lib/dumps";
import { Bucket } from "@/lib/buckets";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AddToPlannerDialog from "@/components/AddToPlannerDialog";

export interface Draft {
  id: string;
  platform: string | null;
  variant: string | null;
  title: string | null;
  content: string | null;
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  external_url: string | null;
  dump_id: string | null;
  idea_id: string | null;
  bucket_id: string | null;
  created_at: string;
}

const nudges = ["Punchier", "Shorter", "More personal", "Less salesy"];

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  draft: Draft;
  buckets?: Bucket[];
  onChanged: () => void;
}

export default function DraftCard({ draft, buckets, onChanged }: Props) {
  const [content, setContent] = useState(draft.content ?? "");
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState(draft.external_url ?? "");
  const [confirming, setConfirming] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [plannerOpen, setPlannerOpen] = useState(false);

  const queue = useRef<ReturnType<typeof persistedDrafts.open> | null>(null);
  const latestRequested = useRef(content);
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      const handle = persistedDrafts.open(data.user.id, draft.id, draft.content ?? "");
      queue.current = handle;
      const sync = () => { if (active) { const value = handle.get(); latestRequested.current = value.text; setContent(value.text); setSaveState(value.state); } };
      unsubscribe = handle.subscribe(sync);
      sync();
      if (handle.recovered) { toast.info("Recovered changes that hadn't finished saving"); void handle.flush(); }
    });
    const unload = () => { void queue.current?.flush(); };
    window.addEventListener("pagehide", unload);
    return () => { active = false; unsubscribe?.(); window.removeEventListener("pagehide", unload); void queue.current?.flush(); queue.current = null; };
  }, [draft.id]);
  const persist = async (_text: string) => { await queue.current?.flush(); };
  const scheduleSave = (text: string) => { latestRequested.current = text; queue.current?.edit(text); };

  const onEdit = (text: string) => {
    setContent(text);
    setSaveState("idle");
    scheduleSave(text);
  };

  const spec = platformById(draft.platform);
  const format = formatById(draft.variant ?? "");
  // Long-form formats (blog, scripts, email, carousel) are not bound by a social caption limit.
  const limit = format?.longForm ? null : (spec?.limit ?? null);
  const over = limit !== null && content.length > limit;

  // AI rewrites are reviewable suggestions — never an automatic overwrite of the user's text.
  const rewrite = async (nudge: string) => {
    setBusy(true);
    try {
      await queue.current?.flush();
      const { content: next } = await regeneratePost(draft.id, nudge);
      setSuggestion(next);
      setNotes("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't rewrite that.");
    } finally {
      setBusy(false);
    }
  };

  const bringBackMyWords = async () => {
    setBusy(true);
    try {
      const next = await regenerateFromSource(draft.id);
      setSuggestion(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't bring back your words.");
    } finally {
      setBusy(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion === null) return;
    onEdit(suggestion);
    setSuggestion(null);
    toast.success("Your version is back — saving now");
  };

  const share = async () => {
    if (!content.trim()) return toast.error("Nothing to post yet.");
    const { copied } = await shareTo(draft.platform, content);
    toast.success(copied ? "Copied — paste it in" : "Opened the composer");
    setConfirming(true);
  };

  const copyOnly = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied");
  };

  const markPosted = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        external_url: url.trim() || null,
      })
      .eq("id", draft.id);
    setBusy(false);
    if (error) return toast.error("Couldn't mark it posted.");
    toast.success("Marked as posted");
    setConfirming(false);
    onChanged();
  };

  const remove = async () => {
    // Soft delete — undoable from the toast.
    const { error } = await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", draft.id);
    if (error) return toast.error("Couldn't delete that.");
    onChanged();
    toast("Moved to recently deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          await supabase.from("posts").update({ deleted_at: null }).eq("id", draft.id);
          onChanged();
        },
      },
    });
  };

  const setBucket = async (bucketId: string) => {
    const { error } = await supabase
      .from("posts")
      .update({ bucket_id: bucketId === "unsorted" ? null : bucketId })
      .eq("id", draft.id);
    if (error) return toast.error("Couldn't move that.");
    onChanged();
  };

  return (
    <div className="border border-black bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 border border-black bg-secondary text-xs font-medium uppercase tracking-wide">
            {platformLabel(draft.platform)}
          </span>
          <span className="px-3 py-1 border border-black bg-white text-xs uppercase tracking-wide text-muted-foreground">
            {formatLabel(draft.variant)}
          </span>
          {draft.status === "published" && (
            <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5" /> Posted
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {saveState === "saving" && "Saving…"}
          {saveState === "saved" && "Saved"}
          {saveState === "error" && (
            <button onClick={() => persist(latestRequested.current)} className="text-destructive underline">
              Couldn't save — try again
            </button>
          )}
        </span>
      </div>

      {draft.title && <p className="font-display font-bold text-sm">{draft.title}</p>}

      <Textarea
        value={content}
        onChange={(e) => onEdit(e.target.value)}
        className="min-h-[140px] border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
      />
      <p className={`text-xs text-right ${over ? "text-destructive" : "text-muted-foreground"}`}>
        {content.length}
        {limit !== null ? `/${limit}` : ""} characters
      </p>

      {suggestion !== null && (
        <div className="border border-black bg-accent/40 p-3 space-y-2">
          <p className="text-xs uppercase tracking-wide font-medium">Rewrite suggestion — review before applying</p>
          <p className="text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">{suggestion}</p>
          <div className="flex gap-2">
            <button onClick={applySuggestion} className="px-3 py-1.5 border border-black bg-primary text-sm font-medium">
              Use this version
            </button>
            <button onClick={() => setSuggestion(null)} className="px-3 py-1.5 border border-black bg-white text-sm">
              Keep mine
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyOnly}
          disabled={busy}
          className="px-4 py-2 border border-black bg-white text-sm font-medium flex items-center gap-2 hover:bg-secondary disabled:opacity-50"
        >
          <Copy className="w-4 h-4" /> Copy
        </button>
        <button
          onClick={share}
          disabled={busy}
          className="px-4 py-2 border border-black bg-black text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {spec?.share === "intent" ? <ExternalLink className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {shareVerb(draft.platform)}
        </button>
        <button
          onClick={() => setPlannerOpen(true)}
          disabled={busy}
          className="px-4 py-2 border border-black bg-white text-sm flex items-center gap-2 hover:bg-secondary disabled:opacity-50"
        >
          <CalendarPlus className="w-4 h-4" /> {draft.scheduled_at ? "Change plan date" : "Add to planner"}
        </button>
        {buckets && (
          <select
            value={draft.bucket_id ?? "unsorted"}
            onChange={(e) => setBucket(e.target.value)}
            aria-label="Bucket"
            className="h-[38px] px-2 border border-black bg-white text-sm focus:outline-none"
          >
            <option value="unsorted">Unsorted</option>
            {buckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={remove}
          disabled={busy}
          aria-label="Delete"
          className="px-3 py-2 border border-black bg-white text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <AllowanceNote />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Nudge it:</span>
        {nudges.map((n) => (
          <button
            key={n}
            onClick={() => rewrite(n.toLowerCase())}
            disabled={busy}
            className="px-3 py-1 border border-black bg-white text-xs hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {n}
          </button>
        ))}
        <button
          onClick={bringBackMyWords}
          disabled={busy}
          className="px-3 py-1 border border-black bg-highlight text-highlight-foreground text-xs font-medium disabled:opacity-50 flex items-center gap-1"
        >
          <Undo2 className="w-3 h-3" /> Too polished. Bring back my words.
        </button>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Or say what to change…"
            className="h-9 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
          />
          <button
            onClick={() => notes.trim() && rewrite(notes.trim())}
            disabled={busy || !notes.trim()}
            className="px-3 py-2 border border-black bg-accent text-sm flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} /> Redo
          </button>
        </div>
      </div>

      {(confirming || draft.status === "published") && (
        <div className="border-t border-black pt-3 space-y-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link to the live post (optional)"
            className="h-10 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
          />
          <button
            onClick={markPosted}
            disabled={busy}
            className="px-4 py-2 border border-black bg-accent text-sm font-medium disabled:opacity-50"
          >
            {draft.status === "published" ? "Update link" : "I posted this"}
          </button>
        </div>
      )}

      <AddToPlannerDialog
        open={plannerOpen}
        onOpenChange={setPlannerOpen}
        postId={draft.id}
        currentDate={draft.scheduled_at}
        onPlanned={onChanged}
      />
    </div>
  );
}
