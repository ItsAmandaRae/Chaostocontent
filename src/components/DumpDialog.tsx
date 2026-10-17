import AllowanceNote from "@/components/AllowanceNote";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mic, Square, Upload, Type, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createAudioDump,
  createImageDump,
  createLinkDump,
  createTextDump,
  processDump,
} from "@/lib/dumps";
import { formatDuration } from "@/lib/audio";

type Tab = "voice" | "text" | "image" | "link";

const tabs: { id: Tab; label: string; icon: typeof Mic }[] = [
  { id: "voice", label: "Voice", icon: Mic },
  { id: "text", label: "Note", icon: Type },
  { id: "image", label: "Screenshot", icon: ImageIcon },
  { id: "link", label: "Link", icon: LinkIcon },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSaved?: (dumpId: string) => void;
}

export default function DumpDialog({ open, onOpenChange, user, onSaved }: Props) {
  const [tab, setTab] = useState<Tab>("voice");
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setText("");
      setUrl("");
      setNote("");
      setFile(null);
      setAudioFile(null);
      setSeconds(0);
    }
  }, [open]);

  const stopTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const ext = (recorder.mimeType || "audio/webm").includes("mp4") ? "mp4" : "webm";
        setAudioFile(new File([blob], `voice-note.${ext}`, { type: blob.type }));
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("We couldn't reach your microphone. You can upload a voice note instead.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
    stopTimer();
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let dumpId: string;
      if (tab === "voice") {
        if (!audioFile) throw new Error("Record or choose a voice note first.");
        dumpId = await createAudioDump(user.id, audioFile);
      } else if (tab === "text") {
        dumpId = await createTextDump(user.id, text);
      } else if (tab === "image") {
        if (!file) throw new Error("Choose a screenshot first.");
        dumpId = await createImageDump(user.id, file, note);
      } else {
        dumpId = await createLinkDump(user.id, url, note);
      }

      toast.success("Original saved.");
      onOpenChange(false);
      onSaved?.(dumpId);

      processDump(dumpId)
        .then(() => onSaved?.(dumpId))
        .catch((e) => toast.error(e instanceof Error ? e.message : "We couldn't read that one."));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save that.");
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    (tab === "voice" && !!audioFile) ||
    (tab === "text" && text.trim().length > 0) ||
    (tab === "image" && !!file) ||
    (tab === "link" && url.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl">Dump it</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Throw it in half-finished. Your original is saved first.
        </p>

        <div className="grid grid-cols-4 gap-0 border border-black">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1 py-3 text-xs uppercase tracking-wide border-r border-black last:border-r-0 transition-colors ${
                tab === t.id ? "bg-primary" : "bg-white hover:bg-secondary"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {(tab === "voice" || tab === "image") && <AllowanceNote media />}

        {tab === "voice" && (
          <div className="space-y-3">
            {recording ? (
              <button
                onClick={stopRecording}
                className="w-full flex items-center justify-center gap-2 border border-black bg-destructive text-destructive-foreground h-14 font-display font-bold"
              >
                <Square className="w-5 h-5" /> Stop ({formatDuration(seconds) || "0:00"})
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-full flex items-center justify-center gap-2 border border-black bg-primary h-14 font-display font-bold"
              >
                <Mic className="w-5 h-5" /> {audioFile ? "Record again" : "Start recording"}
              </button>
            )}
            {audioFile && !recording && (
              <p className="text-sm">Ready: {audioFile.name}</p>
            )}
            <label className="flex items-center gap-3 border border-dashed border-black p-4 cursor-pointer hover:bg-secondary transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-sm">Or upload a voice note (under 25 MB)</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        )}

        {tab === "text" && (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Whatever's in your head. Messy is fine."
            className="min-h-[160px] border border-black rounded-none focus-visible:ring-0 focus-visible:border-black"
          />
        )}

        {tab === "image" && (
          <div className="space-y-3">
            <label className="flex items-center gap-3 border border-dashed border-black p-4 cursor-pointer hover:bg-secondary transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-sm">{file ? file.name : "Choose a screenshot or photo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why did you save this? (optional)"
              className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black"
            />
          </div>
        )}

        {tab === "link" && (
          <div className="space-y-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What caught your eye? (optional)"
              className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black"
            />
          </div>
        )}

        <button
          onClick={save}
          disabled={saving || !canSave}
          className="mt-2 bg-highlight text-highlight-foreground border border-black h-12 px-6 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Dump it"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
