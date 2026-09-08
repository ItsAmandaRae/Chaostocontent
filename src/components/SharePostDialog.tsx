import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { platformLabel } from "@/lib/platforms";
import { openXIntent, limitFor } from "@/lib/share";
import { externalUrlSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PostRecord, ChannelOption } from "@/components/PostComposer";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostRecord | null;
  channel?: ChannelOption | null;
  onSaved: () => void;
}

export default function SharePostDialog({ open, onOpenChange, post, channel, onSaved }: Props) {
  const [url, setUrl] = useState("");
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(post?.external_url ?? "");
      setShared(false);
    }
  }, [open, post]);

  if (!post) return null;

  const content = post.content ?? "";
  const platform = channel?.platform;
  const isX = platform === "twitter";
  const limit = limitFor(platform);
  const overLimit = limit !== null && content.length > limit;

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Post text copied");
    setShared(true);
  };

  const share = () => {
    if (!content.trim()) {
      toast.error("Write some content first");
      return;
    }
    openXIntent(content);
    setShared(true);
  };

  const markPublished = async () => {
    const trimmed = url.trim();
    if (trimmed) {
      const parsed = externalUrlSchema.safeParse(trimmed);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }
    }
    setSaving(true);
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        scheduled_at: null,
        external_url: url.trim() || null,
      })
      .eq("id", post.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to mark as published");
      return;
    }
    toast.success("Marked as published");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl">
            Publish to {platform ? platformLabel(platform) : "your channel"}
          </DialogTitle>
        </DialogHeader>

        <div className="border border-black bg-secondary p-3 text-sm whitespace-pre-wrap">
          {content || "This post has no content yet."}
        </div>
        {limit !== null && (
          <p className={`text-xs ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
            {content.length}/{limit} characters
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {isX && (
            <button
              onClick={share}
              disabled={overLimit}
              className="px-4 py-2 border border-black bg-black text-white font-medium hover:bg-white hover:text-black transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              Share to X
            </button>
          )}
          <button
            onClick={copy}
            className="px-4 py-2 border border-black bg-white font-medium hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy text
          </button>
          {shared && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Check className="w-4 h-4" /> Ready to confirm
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium uppercase tracking-wide mb-2">
            Link to the live post (optional)
          </label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://x.com/you/status/…"
            className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
          />
        </div>

        <DialogFooter className="mt-2 gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 border border-black bg-white font-display font-bold hover:bg-secondary transition-colors rounded-full"
          >
            Close
          </button>
          <button
            onClick={markPublished}
            disabled={saving}
            className="px-6 py-2 border border-black bg-primary font-display font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 rounded-full"
          >
            {saving ? "Saving..." : "I posted this"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
