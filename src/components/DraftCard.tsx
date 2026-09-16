import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, RefreshCw, Save, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { platformById, platformLabel } from "@/lib/platforms";
import { shareTo, shareVerb } from "@/lib/share";
import { regeneratePost } from "@/lib/dumps";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export interface Draft {
  id: string;
  platform: string | null;
  variant: string | null;
  content: string | null;
  status: string;
  published_at: string | null;
  external_url: string | null;
  dump_id: string | null;
  created_at: string;
}

const nudges = ["Punchier", "Shorter", "More personal", "Less salesy"];

interface Props {
  draft: Draft;
  onChanged: () => void;
}

export default function DraftCard({ draft, onChanged }: Props) {
  const [content, setContent] = useState(draft.content ?? "");
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState(draft.external_url ?? "");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => setContent(draft.content ?? ""), [draft.content]);

  const spec = platformById(draft.platform);
  const limit = spec?.limit ?? null;
  const over = limit !== null && content.length > limit;
  const dirty = content !== (draft.content ?? "");

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("posts")
      .update({ content, char_count: content.length })
      .eq("id", draft.id);
    setBusy(false);
    if (error) return toast.error("Couldn't save that edit.");
    toast.success("Saved");
    onChanged();
  };

  const rewrite = async (nudge: string) => {
    setBusy(true);
    try {
      const { content: next } = await regeneratePost(draft.id, nudge);
      setContent(next);
      setNotes("");
      toast.success("Rewritten");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't rewrite that.");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!content.trim()) return toast.error("Nothing to post yet.");
    const { copied } = await shareTo(draft.platform, content);
    toast.success(copied ? "Copied — paste it in" : "Opened the composer");
    setConfirming(true);
  };

  const markPosted = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        scheduled_at: null,
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
    setBusy(true);
    const { error } = await supabase.from("posts").delete().eq("id", draft.id);
    setBusy(false);
    if (error) return toast.error("Couldn't delete that draft.");
    onChanged();
  };

  return (
    <div className="border border-black bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 border border-black bg-secondary text-xs font-medium uppercase tracking-wide">
            {platformLabel(draft.platform)}
          </span>
          {draft.status === "published" && (
            <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5" /> Posted
            </span>
          )}
        </div>
        <span className={`text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}>
          {content.length}
          {limit !== null ? `/${limit}` : ""} characters
        </span>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[140px] border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
      />

      <div className="flex flex-wrap gap-2">
        {dirty && (
          <button
            onClick={save}
            disabled={busy}
            className="px-4 py-2 border border-black bg-primary text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        )}
        <button
          onClick={share}
          disabled={busy}
          className="px-4 py-2 border border-black bg-black text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {spec?.share === "intent" ? <ExternalLink className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {shareVerb(draft.platform)}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="px-3 py-2 border border-black bg-white text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

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
    </div>
  );
}
