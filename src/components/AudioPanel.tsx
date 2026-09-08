import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2 } from "lucide-react";
import { uploadRecordingAudio, removeRecordingAudio, formatBytes, formatDuration } from "@/lib/audio";

interface Props {
  userId: string;
  projectId: string;
  audioUrl: string | null;
  audioSize?: number | null;
  duration?: number | null;
  audioPath?: string | null;
  onChanged: () => void;
}

export default function AudioPanel({
  userId,
  projectId,
  audioUrl,
  audioSize,
  duration,
  audioPath,
  onChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      await uploadRecordingAudio(userId, projectId, file);
      toast.success("Audio uploaded");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!audioPath) return;
    setBusy(true);
    await removeRecordingAudio(projectId, audioPath, userId);
    setBusy(false);
    toast.success("Audio removed");
    onChanged();
  };

  return (
    <div
      className="border border-black bg-white p-5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <h2 className="font-display font-bold text-lg mb-3">Audio</h2>

      {audioUrl ? (
        <div className="space-y-3">
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {[formatDuration(duration), formatBytes(audioSize)].filter(Boolean).join(" · ")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="px-4 py-2 border border-black bg-white font-medium hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Replace
              </button>
              <button
                onClick={handleRemove}
                disabled={busy}
                className="px-3 py-2 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                aria-label="Remove audio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-full border border-dashed border-black p-8 text-center hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <Upload className="w-8 h-8 mx-auto mb-2" />
          <p className="font-display font-bold">{busy ? "Uploading…" : "Upload an audio file"}</p>
          <p className="text-sm text-muted-foreground">Drag and drop, or click to choose. Max 50 MB.</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
