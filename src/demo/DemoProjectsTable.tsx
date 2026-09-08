import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DemoProject, DemoStatus } from "./seedData";
import { useSeedData } from "./SeedDataProvider";

const statusColors: Record<string, string> = {
  draft: "bg-secondary text-black border-black",
  processing: "bg-accent text-black border-black",
  ready: "bg-primary text-black border-black",
  published: "bg-highlight text-white border-black",
};

const statusLabels: Record<DemoStatus, string> = {
  draft: "Draft",
  processing: "Processing",
  ready: "Ready",
  published: "Published",
};

export default function DemoProjectsTable({ projects }: { projects: DemoProject[] }) {
  const { updateProject, removeProject } = useSeedData();

  const Menu = ({ project }: { project: DemoProject }) => (
    <PopoverContent
      align="end"
      className="w-48 p-2 border border-black rounded-none bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      <button
        onClick={() => toast.info("Renaming is disabled in the demo")}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Rename
      </button>
      <button
        onClick={() => toast.info("Duplicating is disabled in the demo")}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </button>
      <button
        onClick={() => {
          removeProject(project.id);
          toast.success("Removed from this demo session");
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
      <div className="border-t border-black mt-2 pt-2">
        <p className="px-3 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground">Set status</p>
        <div className="grid grid-cols-2 gap-1 px-1">
          {(Object.keys(statusLabels) as DemoStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => updateProject(project.id, { status: s, updated_at: new Date().toISOString() })}
              disabled={project.status === s}
              className="px-2 py-1 text-xs border border-black hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>
    </PopoverContent>
  );

  return (
    <>
      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {projects.map((project) => (
          <div key={project.id} className="border border-black bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/demo/recordings/${project.id}`}
                  className="font-display font-bold text-black truncate block hover:underline"
                >
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
                <Menu project={project} />
              </Popover>
            </div>
            <div className="mt-3">
              <span className={`inline-flex px-3 py-1 text-sm border font-medium ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </span>
            </div>
          </div>
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
            {projects.map((project, index) => (
              <TableRow
                key={project.id}
                className={`border-b border-black hover:bg-white ${
                  index === projects.length - 1 ? "border-b-0" : ""
                }`}
              >
                <TableCell className="font-display font-bold text-black max-w-[280px] truncate">
                  <Link to={`/demo/recordings/${project.id}`} className="hover:underline">
                    {project.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-3 py-1 text-sm border font-medium whitespace-nowrap ${
                      statusColors[project.status]
                    }`}
                  >
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
                    <Menu project={project} />
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
