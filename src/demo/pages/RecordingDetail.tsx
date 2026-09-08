import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, Send, ExternalLink, FileAudio } from "lucide-react";
import { platformLabel } from "@/lib/platforms";
import { useSeedData } from "../SeedDataProvider";

const statusColors: Record<string, string> = {
  draft: "bg-secondary text-black",
  processing: "bg-accent text-black",
  ready: "bg-primary text-black",
  published: "bg-highlight text-white",
};

const formatDuration = (s: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function DemoRecordingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, posts, channels, removePost } = useSeedData();

  const project = projects.find((p) => p.id === id);
  const projectPosts = posts.filter((p) => p.project_id === id);

  if (!project) {
    return (
      <div className="p-8">
        <p className="font-display font-bold text-xl mb-2">Recording not found</p>
        <Link to="/demo/recordings" className="underline">
          Back to recordings
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
          onClick={() => navigate("/demo/recordings")}
          className="flex items-center gap-2 text-sm font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Recordings
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px]">{project.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Created {format(new Date(project.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm border border-black font-medium w-fit ${
              statusColors[project.status] ?? "bg-secondary"
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-black bg-white p-5">
            <h2 className="font-display font-bold text-lg mb-3">Audio</h2>
            <div className="border border-black bg-secondary p-4 flex items-center gap-3">
              <div className="w-12 h-12 border border-black bg-white flex items-center justify-center">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{project.audio_path ?? "No audio attached"}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(project.duration_seconds)} ·{" "}
                  {project.audio_size ? `${(project.audio_size / 1_000_000).toFixed(1)} MB` : "—"}
                </p>
              </div>
            </div>
            <div className="mt-4 h-12 border border-black bg-white flex items-end gap-[3px] px-2 pb-2">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className="flex-1 bg-primary border border-black"
                  style={{ height: `${20 + ((i * 37) % 70)}%` }}
                />
              ))}
            </div>
            <button
              onClick={() => toast.info("Playback is disabled in the demo")}
              className="mt-4 px-4 py-2 border border-black bg-black text-white font-medium hover:bg-white hover:text-black transition-colors"
            >
              Play
            </button>
          </div>

          <div className="border border-black bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg">Posts</h2>
              <button
                onClick={() => toast.info("Writing posts is disabled in the demo")}
                className="px-3 py-1.5 border border-black bg-primary text-sm font-medium hover:bg-primary/80 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Write post
              </button>
            </div>

            {projectPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet for this recording.</p>
            ) : (
              <div className="space-y-3">
                {projectPosts.map((post) => {
                  const channel = channels.find((c) => c.id === post.channel_id);
                  return (
                    <div key={post.id} className="border border-black p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm whitespace-pre-wrap flex-1">{post.content}</p>
                        <span className="px-2 py-0.5 text-[10px] border border-black uppercase font-bold shrink-0">
                          {post.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
                        {channel && <span className="uppercase font-medium">{platformLabel(channel.platform)}</span>}
                        {(post.scheduled_at || post.published_at) && (
                          <span>
                            {format(new Date((post.scheduled_at ?? post.published_at)!), "MMM d, yyyy · h:mm a")}
                          </span>
                        )}
                        {post.external_url && (
                          <a
                            href={post.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => toast.info("Publishing is disabled in the demo")}
                          className="px-3 py-1.5 border border-black bg-black text-white text-xs font-medium hover:bg-white hover:text-black transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Publish
                        </button>
                        <button
                          onClick={() => toast.info("Editing is disabled in the demo")}
                          className="px-3 py-1.5 border border-black text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            removePost(post.id);
                            toast.success("Removed from this demo session");
                          }}
                          aria-label="Delete post"
                          className="px-2 py-1.5 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
