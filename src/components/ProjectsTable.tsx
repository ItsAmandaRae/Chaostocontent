import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Copy, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { projectTitleSchema } from "@/lib/validation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  title: string;
  status: "draft" | "processing" | "ready" | "published";
  created_at: string;
  updated_at: string;
}

interface ProjectsTableProps {
  projects: Project[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-secondary text-black border-black",
  processing: "bg-accent text-black border-black",
  ready: "bg-primary text-black border-black",
  published: "bg-highlight text-white border-black",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  processing: "Processing",
  ready: "Ready",
  published: "Published",
};


const scopedUserId = async () => (await supabase.auth.getUser()).data.user?.id ?? null;

export default function ProjectsTable({ projects, onRefresh }: ProjectsTableProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!selectedProject) return;
    const parsed = projectTitleSchema.safeParse(newTitle);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const uid = await scopedUserId();
    if (!uid) return;
    setLoading(true);

    const { error } = await supabase
      .from("projects")
      .update({ title: parsed.data })
      .eq("id", selectedProject.id)
      .eq("user_id", uid);

    setLoading(false);
    
    if (error) {
      toast.error("Failed to rename project");
    } else {
      toast.success("Project renamed");
      setRenameDialogOpen(false);
      onRefresh();
    }
  };

  const handleDuplicate = async (project: Project) => {
    const uid = await scopedUserId();
    if (!uid) return;
    const { error } = await supabase
      .from("projects")
      .insert({
        title: projectTitleSchema.parse(`${project.title} (Copy)`.slice(0, 120)),
        status: "draft",
        user_id: uid,
      });

    if (error) {
      toast.error("Failed to duplicate project");
    } else {
      toast.success("Project duplicated");
      onRefresh();
    }
  };

  const handleStatusChange = async (project: Project, status: Project["status"]) => {
    const uid = await scopedUserId();
    if (!uid) return;
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", project.id)
      .eq("user_id", uid);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Moved to ${statusLabels[status]}`, {
        description:
          status === "published"
            ? "Publish individual posts from the recording to send them out."
            : undefined,
      });
      onRefresh();
    }
  };

  const StatusMenu = ({ project }: { project: Project }) => (
    <div className="border-t border-black mt-2 pt-2">
      <p className="px-3 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Set status</p>
      <div className="grid grid-cols-2 gap-1 px-1">
        {(Object.keys(statusLabels) as Project["status"][]).map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(project, s)}
            disabled={project.status === s}
            className="px-2 py-1 text-xs border border-black hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>
    </div>
  );

  const handleDelete = async () => {

    if (!selectedProject) return;
    const uid = await scopedUserId();
    if (!uid) return;
    setLoading(true);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", selectedProject.id)
      .eq("user_id", uid);

    setLoading(false);
    
    if (error) {
      toast.error("Failed to delete project");
    } else {
      toast.success("Project deleted");
      setDeleteDialogOpen(false);
      onRefresh();
    }
  };

  const openRenameDialog = (project: Project) => {
    setSelectedProject(project);
    setNewTitle(project.title);
    setRenameDialogOpen(true);
  };

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  // Projects are now passed from parent (already includes defaults if needed)
  const displayProjects = projects;

  const ProjectCard = ({ project }: { project: Project }) => (
    <div className="border border-black bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/dashboard/recordings/${project.id}`} className="font-display font-bold text-black truncate block hover:underline">
            {project.title}
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(project.updated_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 hover:bg-secondary border border-transparent hover:border-black transition-colors shrink-0">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2 border border-black rounded-none bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => openRenameDialog(project)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={() => handleDuplicate(project)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            <button
              onClick={() => openDeleteDialog(project)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <StatusMenu project={project} />

          </PopoverContent>

        </Popover>
      </div>
      <div className="mt-3">
        <span className={`inline-flex px-3 py-1 text-sm border font-medium ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {displayProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Desktop Table */}
      <div className="border border-black bg-white hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black bg-secondary hover:bg-secondary">
              <TableHead className="font-display font-black text-black">Title</TableHead>
              <TableHead className="font-display font-black text-black">Status</TableHead>
              <TableHead className="font-display font-black text-black">Last Modified</TableHead>
              <TableHead className="font-display font-black text-black w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayProjects.map((project, index) => (
              <TableRow 
                key={project.id} 
                className={`border-b border-black hover:bg-white ${index === displayProjects.length - 1 ? 'border-b-0' : ''}`}
              >
                <TableCell className="font-display font-bold text-black max-w-[200px] truncate">
                  <Link to={`/dashboard/recordings/${project.id}`} className="hover:underline">
                    {project.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-3 py-1 text-sm border font-medium whitespace-nowrap ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                </TableCell>
                <TableCell className="text-black whitespace-nowrap">
                  {format(new Date(project.updated_at), "MMM d, yyyy 'at' h:mm a")}
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-2 hover:bg-secondary border border-transparent hover:border-black transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-2 border border-black rounded-none bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <button
                        onClick={() => openRenameDialog(project)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Rename
                      </button>
                      <button
                        onClick={() => handleDuplicate(project)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => openDeleteDialog(project)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <StatusMenu project={project} />
                    </PopoverContent>

                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-xl">Rename Project</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new title"
            className="mt-4 border border-black rounded-none focus:ring-0 focus:border-black"
          />
          <DialogFooter className="mt-4 gap-2">
            <button 
              onClick={() => setRenameDialogOpen(false)}
              className="px-6 py-2 border border-black bg-white font-display font-bold hover:bg-secondary transition-colors rounded-full"
            >
              Cancel
            </button>
            <button 
              onClick={handleRename} 
              disabled={loading || !newTitle.trim()}
              className="px-6 py-2 border border-black bg-primary font-display font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-xl">Delete Project</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
          </p>
          <DialogFooter className="mt-4 gap-2">
            <button 
              onClick={() => setDeleteDialogOpen(false)}
              className="px-6 py-2 border border-black bg-white font-display font-bold hover:bg-secondary transition-colors rounded-full"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete} 
              disabled={loading}
              className="px-6 py-2 border border-black bg-destructive text-white font-display font-bold hover:bg-destructive/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
