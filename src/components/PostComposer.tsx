import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { platformLabel } from "@/lib/platforms";
import { limitFor } from "@/lib/share";
import { postContentSchema } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface PostRecord {
  id: string;
  project_id: string;
  channel_id: string | null;
  content: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  external_url?: string | null;
}

export interface ChannelOption {
  id: string;
  platform: string;
  handle: string | null;
}

export interface ProjectOption {
  id: string;
  title: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  projects: ProjectOption[];
  channels: ChannelOption[];
  post?: PostRecord | null;
  defaultProjectId?: string;
  defaultDate?: Date;
  lockProject?: boolean;
  onSaved: () => void;
}

export default function PostComposer({
  open,
  onOpenChange,
  userId,
  projects,
  channels,
  post,
  defaultProjectId,
  defaultDate,
  lockProject,
  onSaved,
}: Props) {
  const [projectId, setProjectId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("scheduled");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (post) {
      const when = post.scheduled_at ?? post.published_at;
      setProjectId(post.project_id);
      setChannelId(post.channel_id ?? "");
      setContent(post.content ?? "");
      setStatus((post.status as typeof status) ?? "draft");
      setDate(format(when ? new Date(when) : new Date(), "yyyy-MM-dd"));
      setTime(format(when ? new Date(when) : new Date(), "HH:mm"));
    } else {
      setProjectId(defaultProjectId || projects[0]?.id || "");
      setChannelId("");
      setContent("");
      setStatus("scheduled");
      setDate(format(defaultDate ?? new Date(), "yyyy-MM-dd"));
      setTime("09:00");
    }
  }, [open, post, defaultProjectId, defaultDate, projects]);

  const channel = channels.find((c) => c.id === channelId);
  const limit = limitFor(channel?.platform);
  const overLimit = limit !== null && content.length > limit;

  const save = async () => {
    if (!projectId) return;
    const parsedContent = postContentSchema.safeParse(content);
    if (!parsedContent.success) {
      toast.error(parsedContent.error.issues[0].message);
      return;
    }
    if (overLimit) {
      toast.error("Content is over the platform character limit");
      return;
    }
    setSaving(true);
    const when = new Date(`${date}T${time || "09:00"}`).toISOString();
    const payload = {
      project_id: projectId,
      channel_id: channelId || null,
      content: parsedContent.data || null,
      status,
      scheduled_at: status === "published" ? null : when,
      published_at: status === "published" ? when : null,
    };

    const { error } = post
      ? await supabase.from("posts").update(payload).eq("id", post.id).eq("user_id", userId)
      : await supabase.from("posts").insert({ ...payload, user_id: userId });

    setSaving(false);
    if (error) {
      toast.error(post ? "Failed to update post" : "Failed to save post");
      return;
    }
    toast.success(post ? "Post updated" : "Post saved");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl">
            {post ? "Edit post" : "Write a post"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-2">Recording</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={lockProject}
              className="w-full h-12 px-4 border border-black bg-white font-body text-sm focus:outline-none disabled:opacity-60"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium uppercase tracking-wide mb-2">Channel</label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full h-12 px-4 border border-black bg-white font-body text-sm focus:outline-none"
            >
              <option value="">No channel</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {platformLabel(c.platform)}{c.handle ? ` — @${c.handle}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium uppercase tracking-wide">Content</label>
              {limit !== null && (
                <span className={`text-xs font-medium ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
                  {content.length}/{limit}
                </span>
              )}
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What goes out?"
              className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black min-h-32"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium uppercase tracking-wide mb-2">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium uppercase tracking-wide mb-2">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium uppercase tracking-wide mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full h-12 px-4 border border-black bg-white font-body text-sm uppercase tracking-wide focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Scheduling puts the post on your calendar. When it's time, open it and use Share to post it
            yourself — nothing sends automatically.
          </p>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 border border-black bg-white font-display font-bold hover:bg-secondary transition-colors rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !projectId || overLimit}
            className="px-6 py-2 border border-black bg-primary font-display font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
          >
            {saving ? "Saving..." : post ? "Save changes" : "Save post"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
