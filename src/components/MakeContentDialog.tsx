import AllowanceNote from "@/components/AllowanceNote";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORMS, FORMATS, defaultFormatFor, platformById } from "@/lib/platforms";
import { generateContent } from "@/lib/dumps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Exactly one source: dump id(s) or a saved idea id. */
  dumpIds?: string[];
  ideaId?: string;
  /** Kept for backwards compatibility — the voice choice is now always offered. */
  suggestReference?: boolean;
  onCreated: (postId: string) => void;
}

const selectClass =
  "w-full h-11 px-3 border border-black bg-white text-sm rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-black";

export default function MakeContentDialog({ open, onOpenChange, dumpIds, ideaId, onCreated }: Props) {
  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("text_post");
  const [voiceMode, setVoiceMode] = useState<"my_words" | "reference">("my_words");
  const [referenceNote, setReferenceNote] = useState("");
  const [notes, setNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [busy, setBusy] = useState(false);

  // Fresh state for every source — nothing leaks between a dump and an idea.
  const sourceKey = `${ideaId ?? ""}|${(dumpIds ?? []).join(",")}`;
  useEffect(() => {
    if (!open) return;
    setFormat(defaultFormatFor(platform));
    setVoiceMode("my_words");
    setReferenceNote("");
    setNotes("");
    setShowDetails(false);
    // Pre-select the first Brand DNA platform when the dialog opens.
    supabase
      .from("brand_profiles")
      .select("platforms")
      .maybeSingle()
      .then(({ data }) => {
        const first = data?.platforms?.find((id) => platformById(id));
        if (first) {
          setPlatform(first);
          setFormat(defaultFormatFor(first));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sourceKey]);

  const pickPlatform = (id: string) => {
    setPlatform(id);
    setFormat(defaultFormatFor(id));
  };

  const create = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const post = await generateContent({
        dumpIds,
        ideaId,
        platform,
        format,
        voiceMode,
        referenceNote: voiceMode === "reference" ? referenceNote : undefined,
        notes,
      });
      toast.success("Your content is ready");
      onOpenChange(false);
      onCreated(post.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the content.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-black rounded-none max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl">Make content</DialogTitle>
          <DialogDescription className="text-sm">
            One piece at a time. Your original stays untouched.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <AllowanceNote />
          <div>
            <label htmlFor="mc-platform" className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Where it's going
            </label>
            <select
              id="mc-platform"
              value={platform}
              onChange={(e) => pickPlatform(e.target.value)}
              className={selectClass}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mc-format" className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Content type
            </label>
            <select
              id="mc-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={selectClass}
            >
              {FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} — {f.hint}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Whose words are these?</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setVoiceMode("my_words")}
                aria-pressed={voiceMode === "my_words"}
                className={`text-left px-3 py-2 border border-black text-sm transition-colors ${
                  voiceMode === "my_words" ? "bg-accent" : "bg-white hover:bg-secondary"
                }`}
              >
                <span className="font-medium block">My words</span>
                <span className="text-xs text-muted-foreground">Something I said or wrote</span>
              </button>
              <button
                onClick={() => setVoiceMode("reference")}
                aria-pressed={voiceMode === "reference"}
                className={`text-left px-3 py-2 border border-black text-sm transition-colors ${
                  voiceMode === "reference" ? "bg-accent" : "bg-white hover:bg-secondary"
                }`}
              >
                <span className="font-medium block">Reference material</span>
                <span className="text-xs text-muted-foreground">Someone else's writing — write from my perspective</span>
              </button>
            </div>
            {voiceMode === "reference" && (
              <Textarea
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                placeholder="What do you want to say about this? (optional — leave blank and we'll keep it factual, in your voice)"
                className="mt-2 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
              />
            )}
          </div>

          <div>
            <button
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              className="text-xs uppercase tracking-wide text-muted-foreground underline underline-offset-2"
            >
              {showDetails ? "Hide extra direction" : "Add extra direction (optional)"}
            </button>
            {showDetails && (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. lead with the mistake I made"
                className="mt-2 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
              />
            )}
          </div>

          <button
            onClick={create}
            disabled={busy}
            className="w-full bg-highlight text-highlight-foreground border border-black h-12 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 motion-reduce:transition-none motion-reduce:transform-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {busy ? "Writing in your voice…" : "Make content"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
