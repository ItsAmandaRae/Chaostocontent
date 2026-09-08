import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useOutletContext } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Mic, Search, SlidersHorizontal, Upload } from "lucide-react";
import ProjectsTable from "@/components/ProjectsTable";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { uploadRecordingAudio, isAudioFile } from "@/lib/audio";

interface Project {
  id: string;
  title: string;
  status: "draft" | "processing" | "ready" | "published";
  created_at: string;
  updated_at: string;
}

const statusFilters: ("all" | Project["status"])[] = [
  "all",
  "draft",
  "processing",
  "ready",
  "published",
];

const statusLabels: Record<string, string> = {
  all: "All",
  draft: "Draft",
  processing: "Processing",
  ready: "Ready",
  published: "Published",
};

export default function Recordings() {
  const { user } = useOutletContext<{ user: User | null }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<"all" | Project["status"]>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "title">("updated");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<Project["status"]>("draft");
  const [creating, setCreating] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleCreate = async () => {
    if (!user || !newTitle.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        status: newStatus,
      })
      .select("id")
      .single();

    if (error || !data) {
      setCreating(false);
      toast.error("Failed to create recording");
      return;
    }

    if (audioFile) {
      try {
        await uploadRecordingAudio(user.id, data.id, audioFile);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Audio upload failed");
      }
    }

    setCreating(false);
    toast.success("Recording created");
    setCreateOpen(false);
    setNewTitle("");
    setNewStatus("draft");
    setAudioFile(null);
    fetchProjects();
    navigate(`/dashboard/recordings/${data.id}`);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setProjects(data as Project[]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (filter !== "all") {
      result = result.filter((p) => p.status === filter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(term));
    }
    if (sort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "created") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [projects, filter, search, sort]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground">
            Recordings
          </h1>
          <button onClick={() => setCreateOpen(true)} className="bg-highlight text-highlight-foreground border border-black h-12 px-6 rounded-full text-base font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out w-full sm:w-auto flex items-center justify-center gap-2">
            <Mic className="w-5 h-5" />
            Record New
          </button>
        </div>




        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recordings..."
              className="pl-10 border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 border border-black text-sm font-medium uppercase tracking-wide whitespace-nowrap transition-colors ${
                  filter === s
                    ? "bg-primary text-black"
                    : "bg-white hover:bg-secondary"
                }`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-12 px-4 border border-black bg-white font-body text-sm uppercase tracking-wide focus:outline-none"
          >
            <option value="updated">Last Modified</option>
            <option value="created">Newest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="border border-black bg-white p-8 sm:p-12 text-center">
            <Mic className="w-12 h-12 mx-auto mb-4 text-black" />
            <h3 className="font-display font-bold text-xl mb-2">No recordings found</h3>
            <p className="text-muted-foreground mb-6">
              {projects.length === 0
                ? "Record your first thought to get started."
                : "Try adjusting your filters or search."}
            </p>
            <button onClick={() => setCreateOpen(true)} className="bg-primary text-black border border-black h-12 px-6 rounded-full font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out">
              Start Recording
            </button>
          </div>
        ) : (
          <ProjectsTable projects={filteredProjects} onRefresh={fetchProjects} />
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <DialogHeader>
              <DialogTitle className="font-display font-black text-xl">New Recording</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium uppercase tracking-wide mb-2">Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What's this recording about?"
                  className="border border-black rounded-none focus-visible:ring-0 focus-visible:border-black h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium uppercase tracking-wide mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Project["status"])}
                  className="w-full h-12 px-4 border border-black bg-white font-body text-sm uppercase tracking-wide focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium uppercase tracking-wide mb-2">Audio file (optional)</label>
                <label className="flex items-center gap-3 border border-dashed border-black p-4 cursor-pointer hover:bg-secondary transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">
                    {audioFile ? audioFile.name : "Choose an audio file (max 50 MB)"}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && !isAudioFile(file)) {
                        toast.error("Please choose an audio file");
                        return;
                      }
                      setAudioFile(file ?? null);
                    }}
                  />
                </label>
              </div>
            </div>
            <DialogFooter className="mt-4 gap-2">
              <button
                onClick={() => setCreateOpen(false)}
                className="px-6 py-2 border border-black bg-white font-display font-bold hover:bg-secondary transition-colors rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newTitle.trim()}
                className="px-6 py-2 border border-black bg-primary font-display font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

    </div>
  );
}
