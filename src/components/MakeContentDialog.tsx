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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Exactly one source: dump id(s) or a saved idea id. */
  dumpIds?: string[];
  ideaId?: string;
  /** Screenshots/links may be someone else's writing — offer the voice choice. */
  suggestReference?: boolean;
  onCreated: (postId: string) => void;
}

export default function MakeContentDialog({ open, onOpenChange, dumpIds, ideaId, suggestReference, onCreated }: Props) {
  const [platform, setPlatform] = useState("instagram");
  const [format, setFormat] = useState("text_post");
  const [voiceMode, setVoiceMode] = useState<"my_words" | "reference">("my_words");
  const [referenceNote, setReferenceNote] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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
        voiceMode: suggestReference ? voiceMode : "my_words",
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
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Where it's going</p>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => pickPlatform(p.id)}
                  className={`text-left px-3 py-2 border border-black text-sm transition-colors ${
                    platform === p.id ? "bg-primary" : "bg-white hover:bg-secondary"
                  }`}
                >
                  <span className="font-medium block">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">What shape</p>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`text-left px-3 py-2 border border-black text-sm transition-colors ${
                    format === f.id ? "bg-secondary" : "bg-white hover:bg-secondary"
                  }`}
                >
                  <span className="font-medium block">{f.label}</span>
                  <span className="text-xs text-muted-foreground">{f.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {suggestReference && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Whose words are these?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVoiceMode("my_words")}
                  className={`text-left px-3 py-2 border border-black text-sm transition-colors ${
                    voiceMode === "my_words" ? "bg-accent" : "bg-white hover:bg-secondary"
                  }`}
                >
                  <span className="font-medium block">My words</span>
                  <span className="text-xs text-muted-foreground">Write in my voice</span>
                </button>
                <button
                  onClick={() => setVoiceMode("reference")}
                  className={`text-left px-3 py-2 border border-black text-sm transition-colors ${
                    voiceMode === "reference" ? "bg-accent" : "bg-white hover:bg-secondary"
                  }`}
                >
                  <span className="font-medium block">Reference material</span>
                  <span className="text-xs text-muted-foreground">Someone else's writing</span>
                </button>
              </div>
              {voiceMode === "reference" && (
                <Textarea
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  placeholder="What do you want to say about this? (optional — leave blank for factual angles)"
                  className="mt-2 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
                />
              )}
            </div>
          )}

          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any direction? e.g. lead with the mistake I made"
            className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-11"
          />

          <button
            onClick={create}
            disabled={busy}
            className="w-full bg-highlight text-highlight-foreground border border-black h-12 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {busy ? "Writing in your voice…" : "Make content"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
