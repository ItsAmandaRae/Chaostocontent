import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mic, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import DemoProjectsTable from "../DemoProjectsTable";
import { useSeedData } from "../SeedDataProvider";
import { DemoStatus } from "../seedData";

const statusFilters: ("all" | DemoStatus)[] = ["all", "draft", "processing", "ready", "published"];

const statusLabels: Record<string, string> = {
  all: "All",
  draft: "Draft",
  processing: "Processing",
  ready: "Ready",
  published: "Published",
};

export default function DemoRecordings() {
  const { projects } = useSeedData();
  const [filter, setFilter] = useState<"all" | DemoStatus>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "title">("updated");

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (filter !== "all") result = result.filter((p) => p.status === filter);
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(term));
    }
    if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "created")
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return result;
  }, [projects, filter, search, sort]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground">
            Recordings
          </h1>
          <button
            onClick={() => toast.info("Uploading is disabled in the demo — sign up to record for real")}
            className="bg-highlight text-highlight-foreground border border-black h-12 px-6 rounded-full text-base font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[6px] active:translate-y-[6px] transition-all duration-200 ease-out w-full sm:w-auto flex items-center justify-center gap-2"
          >
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
                  filter === s ? "bg-primary text-black" : "bg-white hover:bg-secondary"
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
            <p className="text-muted-foreground">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <DemoProjectsTable projects={filteredProjects} />
        )}
      </motion.div>
    </div>
  );
}
