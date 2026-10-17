import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Search, Plus, Sparkles, Trash2 } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BucketChips from "@/components/BucketChips";
import MakeContentDialog from "@/components/MakeContentDialog";
import { Bucket, loadBuckets } from "@/lib/buckets";

interface Idea {
  id: string;
  title: string;
  angle: string | null;
  source_excerpt: string | null;
  dump_id: string | null;
  bucket_id: string | null;
  created_at: string;
}

export default function IdeaBank() {
  const { user } = useOutletContext<{ user: User | null }>();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [bucket, setBucket] = useState("all");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAngle, setNewAngle] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAngle, setEditAngle] = useState("");
  const [makeFrom, setMakeFrom] = useState<Idea | null>(null);

  const load = async () => {
    const [{ data }, b] = await Promise.all([
      supabase.from("ideas").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      loadBuckets().catch(() => [] as Bucket[]),
    ]);
    setIdeas((data ?? []) as Idea[]);
    setBuckets(b);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ideas.filter((i) => {
      if (bucket === "unsorted" && i.bucket_id) return false;
      if (bucket !== "all" && bucket !== "unsorted" && i.bucket_id !== bucket) return false;
      if (term && !`${i.title} ${i.angle ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [ideas, bucket, search]);

  const addManual = async () => {
    if (!user || !newTitle.trim()) return;
    const { error } = await supabase.from("ideas").insert({
      user_id: user.id,
      title: newTitle.trim().slice(0, 160),
      angle: newAngle.trim() || null,
    });
    if (error) return toast.error("Couldn't save that idea.");
    setNewTitle("");
    setNewAngle("");
    setAdding(false);
    load();
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from("ideas")
      .update({ title: editTitle.trim().slice(0, 160) || "Untitled idea", angle: editAngle.trim() || null })
      .eq("id", id);
    if (error) return toast.error("Couldn't save that edit.");
    setEditing(null);
    load();
  };

  const setBucketFor = async (id: string, bucketId: string) => {
    const { error } = await supabase
      .from("ideas")
      .update({ bucket_id: bucketId === "unsorted" ? null : bucketId })
      .eq("id", id);
    if (error) return toast.error("Couldn't move that.");
    load();
  };

  const remove = async (idea: Idea) => {
    const { error } = await supabase.from("ideas").update({ deleted_at: new Date().toISOString() }).eq("id", idea.id);
    if (error) return toast.error("Couldn't delete that idea.");
    load();
    toast("Idea moved to recently deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          await supabase.from("ideas").update({ deleted_at: null }).eq("id", idea.id);
          load();
        },
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px] mb-1">Idea Bank</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The golden nuggets you pulled out — ready whenever you are.
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {user && (
            <BucketChips userId={user.id} buckets={buckets} active={bucket} onSelect={setBucket} onChanged={load} />
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your ideas…"
                className="pl-10 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
              />
            </div>
            <button
              onClick={() => setAdding((v) => !v)}
              className="h-12 px-5 border border-black bg-white font-medium flex items-center gap-2 hover:bg-secondary"
            >
              <Plus className="w-4 h-4" /> Add an idea
            </button>
          </div>
        </div>

        {adding && (
          <div className="border border-black bg-white p-4 space-y-3 mb-6">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="The idea, in a few words"
              className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-11"
            />
            <Textarea
              value={newAngle}
              onChange={(e) => setNewAngle(e.target.value)}
              placeholder="The angle or details (optional)"
              className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
            />
            <button
              onClick={addManual}
              disabled={!newTitle.trim()}
              className="px-5 py-2 border border-black bg-primary font-medium disabled:opacity-50"
            >
              Save idea
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="border border-black bg-white p-8 sm:p-12 text-center">
            <h3 className="font-display font-bold text-xl mb-2">No ideas here yet</h3>
            <p className="text-muted-foreground mb-6">
              Open a Brain Dump and hit "Pull out ideas" — or add one yourself above.
            </p>
            <Link
              to="/dashboard/brain-dumps"
              className="inline-block bg-primary border border-black h-12 px-6 leading-[3rem] rounded-full font-medium shadow-[4px_6px_0px_0px_black]"
            >
              Go to Brain Dumps
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((idea) => (
              <div key={idea.id} className="border border-black bg-white p-4 space-y-3">
                {editing === idea.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-10"
                    />
                    <Textarea
                      value={editAngle}
                      onChange={(e) => setEditAngle(e.target.value)}
                      className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black text-sm"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(idea.id)} className="px-4 py-1.5 border border-black bg-primary text-sm font-medium">
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} className="px-4 py-1.5 border border-black bg-white text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditing(idea.id);
                        setEditTitle(idea.title);
                        setEditAngle(idea.angle ?? "");
                      }}
                      className="text-left"
                    >
                      <h3 className="font-display font-bold">{idea.title}</h3>
                      {idea.angle && <p className="text-sm text-muted-foreground mt-1">{idea.angle}</p>}
                    </button>
                    {idea.source_excerpt && (
                      <blockquote className="border-l-2 border-black pl-3 text-sm text-muted-foreground italic">
                        "{idea.source_excerpt}"
                      </blockquote>
                    )}
                    {idea.dump_id && (
                      <Link
                        to={`/dashboard/brain-dumps/${idea.dump_id}`}
                        className="text-xs underline text-muted-foreground inline-block"
                      >
                        From this Brain Dump
                      </Link>
                    )}
                  </>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setMakeFrom(idea)}
                    className="px-4 py-2 border border-black bg-highlight text-highlight-foreground text-sm font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Make content
                  </button>
                  {buckets.length > 0 && (
                    <select
                      value={idea.bucket_id ?? "unsorted"}
                      onChange={(e) => setBucketFor(idea.id, e.target.value)}
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
                    onClick={() => remove(idea)}
                    aria-label="Delete idea"
                    className="px-3 py-2 border border-black bg-white text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <MakeContentDialog
          open={!!makeFrom}
          onOpenChange={(open) => !open && setMakeFrom(null)}
          ideaId={makeFrom?.id}
          onCreated={(postId) => navigate(`/dashboard/posts?open=${postId}`)}
        />
      </motion.div>
    </div>
  );
}
