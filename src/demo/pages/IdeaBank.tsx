import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Trash2, Undo2 } from "lucide-react";

interface DemoIdea {
  id: string;
  title: string;
  angle: string;
  excerpt: string;
  bucket: string;
}

const SAMPLE_BUCKETS = ["Launch week", "Evergreen"];

const INITIAL_IDEAS: DemoIdea[] = [
  {
    id: "demo-1",
    title: "The 3-tab rule that saved my mornings",
    angle: "How closing everything but 3 tabs cut my startup time in half",
    excerpt: "every morning I'd open 40 tabs and feel behind before I started",
    bucket: "Evergreen",
  },
  {
    id: "demo-2",
    title: "What I tell clients who 'suck at posting'",
    angle: "Reframe: it's not consistency, it's capture — the ideas already exist",
    excerpt: "you don't have a content problem, you have a capture problem",
    bucket: "Launch week",
  },
  {
    id: "demo-3",
    title: "Voice notes > blank page",
    angle: "Why ranting into my phone for 4 minutes beats staring at a cursor",
    excerpt: "said the whole post out loud in the car, it was just sitting there",
    bucket: "Evergreen",
  },
];

export default function DemoIdeaBank() {
  const [ideas, setIdeas] = useState(INITIAL_IDEAS);
  const [bucket, setBucket] = useState("all");
  const [deleted, setDeleted] = useState<DemoIdea | null>(null);

  const visible = ideas.filter((i) => bucket === "all" || i.bucket === bucket);

  const remove = (idea: DemoIdea) => {
    setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
    setDeleted(idea);
    toast("Idea removed (demo only)", {
      action: {
        label: "Undo",
        onClick: () => {
          setIdeas((prev) => [...prev, idea]);
          setDeleted(null);
        },
      },
    });
  };

  void deleted;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-[-0.5px] mb-1">Idea Bank</h1>
        <p className="text-sm text-muted-foreground mb-2">
          The golden nuggets you pulled out — ready whenever you are.
        </p>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-6">
          Sample data — changes here stay in this demo and are never saved or sent to AI.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", ...SAMPLE_BUCKETS].map((b) => (
            <button
              key={b}
              onClick={() => setBucket(b)}
              className={`px-3 py-1.5 border border-black text-sm ${bucket === b ? "bg-primary" : "bg-white hover:bg-secondary"}`}
            >
              {b === "all" ? "All" : b}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((idea) => (
            <div key={idea.id} className="border border-black bg-white p-4 space-y-3">
              <div>
                <h3 className="font-display font-bold">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{idea.angle}</p>
              </div>
              <blockquote className="border-l-2 border-black pl-3 text-sm text-muted-foreground italic">
                "{idea.excerpt}"
              </blockquote>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toast.info("Sign up to turn ideas into content in your voice")}
                  className="px-4 py-2 border border-black bg-highlight text-highlight-foreground text-sm font-medium flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Make content
                </button>
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

        <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">
          <Undo2 className="w-3.5 h-3.5" /> Deleting is undoable — nothing is ever lost for good.
        </p>
      </motion.div>
    </div>
  );
}
