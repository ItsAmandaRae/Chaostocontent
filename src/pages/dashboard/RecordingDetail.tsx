import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, Send, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAudioUrl } from "@/lib/audio";
import { platformLabel } from "@/lib/platforms";
import AudioPanel from "@/components/AudioPanel";
import PostComposer, { PostRecord, ChannelOption } from "@/components/PostComposer";
import SharePostDialog from "@/components/SharePostDialog";
import { safeExternalUrl } from "@/lib/validation";

interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
  audio_path: string | null;
  audio_size: number | null;
  duration_seconds: number | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-secondary text-black",
  processing: "bg-accent text-black",
  ready: "bg-primary text-black",
  published: "bg-highlight text-white",
};

export default function RecordingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useOutletContext<{ user: User | null }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [channels, setChannels] = useState<ChannelOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostRecord | null>(null);
  const [sharePost, setSharePost] = useState<PostRecord | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id || !user) return;
    const [{ data: projectData }, { data: postsData }, { data: channelsData }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).maybeSingle(),
      supabase.from("posts").select("*").eq("project_id", id).eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("channels").select("id, platform, handle").eq("user_id", user.id),
    ]);

    setProject((projectData as Project) ?? null);
    setPosts((postsData as PostRecord[]) ?? []);
    setChannels((channelsData as ChannelOption[]) ?? []);
    setAudioUrl(projectData?.audio_path ? await getAudioUrl(projectData.audio_path) : null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  const channelFor = (channelId: string | null) =>
    channels.find((c) => c.id === channelId) ?? null;

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId).eq("user_id", user!.id);
    if (error) {
      toast.error("Failed to delete post");
      return;
    }
    toast.success("Post deleted");
    fetchAll();
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  if (!project) {
    return (
      <div className="p-8">
        <p className="font-display font-bold text-xl mb-2">Recording not found</p>
        <Link to="/dashboard/recordings" className="underline">Back to recordings</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button
          onClick={() => navigate("/dashboard/recordings")}
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
          <span className={`inline-flex px-3 py-1 text-sm border border-black font-medium w-fit ${statusColors[project.status] ?? "bg-secondary"}`}>
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {user && (
            <AudioPanel
              userId={user.id}
              projectId={project.id}
              audioUrl={audioUrl}
              audioPath={project.audio_path}
              audioSize={project.audio_size}
              duration={project.duration_seconds}
              onChanged={fetchAll}
            />
          )}

          <div className="border border-black bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg">Posts</h2>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setComposerOpen(true);
                }}
                className="px-3 py-1.5 border border-black bg-primary text-sm font-medium hover:bg-primary/80 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Write post
              </button>
            </div>

            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No posts yet. Write one and schedule it on the calendar.
              </p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const channel = channelFor(post.channel_id);
                  return (
                    <div key={post.id} className="border border-black p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm whitespace-pre-wrap flex-1">{post.content || "No content yet"}</p>
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
                        {safeExternalUrl(post.external_url) && (
                          <a href={safeExternalUrl(post.external_url)!} target="_blank" rel="noreferrer" className="underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            setSharePost(post);
                            setShareOpen(true);
                          }}
                          className="px-3 py-1.5 border border-black bg-black text-white text-xs font-medium hover:bg-white hover:text-black transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Publish
                        </button>
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setComposerOpen(true);
                          }}
                          className="px-3 py-1.5 border border-black text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
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

      {user && (
        <PostComposer
          open={composerOpen}
          onOpenChange={setComposerOpen}
          userId={user.id}
          projects={[{ id: project.id, title: project.title }]}
          channels={channels}
          post={editingPost}
          defaultProjectId={project.id}
          lockProject
          onSaved={fetchAll}
        />
      )}

      <SharePostDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        post={sharePost}
        channel={sharePost ? channelFor(sharePost.channel_id) : null}
        onSaved={fetchAll}
      />
    </div>
  );
}
