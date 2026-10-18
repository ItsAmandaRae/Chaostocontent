import PlannerBoard from "@/components/PlannerBoard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { planDateISO } from "@/lib/planner";
import { usePlanAccess } from "@/lib/access";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, List, Copy, Trash2, CheckCircle2, CalendarPlus, ExternalLink, Pencil } from "lucide-react";
import { platformLabel, formatLabel } from "@/lib/platforms";
import { shareTo } from "@/lib/share";
import { Draft } from "@/components/DraftCard";
import AddToPlannerDialog from "@/components/AddToPlannerDialog";
import BucketChips from "@/components/BucketChips";
import BucketLegend from "@/components/BucketLegend";
import { Bucket, loadBuckets } from "@/lib/buckets";

export default function Calendar() {
  const navigate = useNavigate();
  const [choosingDay, setChoosingDay] = useState(false);
  const { access } = usePlanAccess();
  const reducedMotion = useReducedMotion();
  const { user } = useOutletContext<{ user: User | null }>();
  const [posts, setPosts] = useState<Draft[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [managingBuckets, setManagingBuckets] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [planning, setPlanning] = useState<Draft | null>(null);
  const [unplannedOpen, setUnplannedOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [{ data: postsData }, b] = await Promise.all([
      supabase.from("posts").select("*").eq("user_id", user.id).is("deleted_at", null).order("scheduled_at", { ascending: true }),
      loadBuckets().catch(() => [] as Bucket[]),
    ]);
    if (postsData) setPosts(postsData as Draft[]);
    setBuckets(b);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const planned = posts.filter((p) => p.scheduled_at);
  const unplanned = posts.filter((p) => !p.scheduled_at);

  // All date handling uses the device's local timezone.
  const postsForDay = (day: Date) =>
    planned.filter((p) => p.scheduled_at && isSameDay(new Date(p.scheduled_at), day));

  const selectedDayPosts = selectedDate ? postsForDay(selectedDate) : [];

  const title = (p: Draft) => p.title || (p.content ?? "").split("\n")[0].slice(0, 60) || "Untitled";

  const copy = async (p: Draft) => {
    await navigator.clipboard.writeText(p.content ?? "");
    toast.success("Copied");
  };

  const share = async (p: Draft) => {
    const { copied } = await shareTo(p.platform, p.content ?? "");
    toast.success(copied ? "Copied — paste it in" : "Opened the composer");
  };

  const removeDate = async (p: Draft) => {
    const { error } = await supabase.from("posts").update({ scheduled_at: null, status: "draft" }).eq("id", p.id);
    if (error) return toast.error("Couldn't remove the date.");
    toast.success("Removed from planner — the content is still in your list");
    fetchData();
  };

  const markPosted = async (p: Draft) => {
    const { error } = await supabase
      .from("posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", p.id);
    if (error) return toast.error("Couldn't mark it posted.");
    toast.success("Marked as posted");
    fetchData();
  };

  const planUnplanned = async (p: Draft, day: Date) => {
    const { error } = await supabase
      .from("posts")
      .update({ scheduled_at: planDateISO(day), status: "scheduled" })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(`Planned for ${format(day, "MMMM d, yyyy")}`);
    setChoosingDay(false);
    fetchData();
  };

  const row = (p: Draft, showDate: boolean) => (
    <div key={p.id} className="p-4 border-b border-black last:border-b-0 flex flex-col gap-2">
      <div>
        <h3 className="font-display font-bold">{title(p)}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{p.content || "No content yet"}</p>
        <p className="text-xs mt-1 font-medium uppercase tracking-wide text-muted-foreground">
          {platformLabel(p.platform)} · {formatLabel(p.variant)}
          {showDate && p.scheduled_at && ` · Planned for ${format(new Date(p.scheduled_at), "MMM d, yyyy")}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {p.status === "published" ? (
          <span className="flex items-center gap-1 px-2 py-1 text-xs border border-black bg-secondary uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" /> Posted
          </span>
        ) : (
          <button
            onClick={() => markPosted(p)}
            className="px-2 py-1 text-xs border border-black bg-white hover:bg-secondary uppercase"
          >
            Mark posted
          </button>
        )}
        <button
          onClick={() => setPlanning(p)}
          aria-label="Change plan date"
          className="p-1.5 border border-black hover:bg-secondary transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
        </button>
        <Link
          to={`/dashboard/posts?open=${p.id}`}
          aria-label="Open and edit"
          className="p-1.5 border border-black bg-white hover:bg-secondary transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button onClick={() => copy(p)} aria-label="Copy" className="p-1.5 border border-black hover:bg-secondary transition-colors">
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => share(p)}
          aria-label="Open in app"
          className="p-1.5 border border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
        {p.scheduled_at && (
          <button
            onClick={() => removeDate(p)}
            aria-label="Remove date"
            className="p-1.5 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground">
              Planner
            </h1>
            <p className="text-sm text-muted-foreground">
              See your content laid out. Nothing posts itself — no deadlines, no guilt.
            </p>
          </div>

        </div>

        {!access?.paid && <p className="mb-5 text-sm text-muted-foreground">Your existing dates and content stay available. Adding or moving dates requires Paid access, which isn't available to purchase yet. <Link className="underline" to="/demo/calendar">Explore fictional planner preview</Link></p>}
        {user && (
          <div className="mb-6">
            <BucketLegend buckets={buckets} />
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setManagingBuckets(true)}>Manage buckets</Button>
            <Dialog open={managingBuckets} onOpenChange={setManagingBuckets}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Manage buckets</DialogTitle><DialogDescription>All buckets remain visible together in your planner.</DialogDescription></DialogHeader><BucketChips managementOnly userId={user.id} buckets={buckets} active="all" onSelect={() => {}} onChanged={fetchData} /></DialogContent></Dialog>
          </div>
        )}

        <PlannerBoard userKey={user?.id ?? "signed-out"} items={planned} buckets={buckets}
          onOpen={(p) => navigate(`/dashboard/posts?open=${p.id}`)}
          onDay={(day) => { setSelectedDate(day); setChoosingDay(true); }} />
        {/* Selected-day detail and editing live in PlannerBoard's single panel to avoid duplicates. */}

        <div className="mt-6 border border-black bg-white">
          <button
            onClick={() => setUnplannedOpen((v) => !v)}
            aria-expanded={unplannedOpen}
            className="w-full p-4 flex items-center justify-between font-display font-bold text-lg hover:bg-secondary/50"
          >
            Not planned yet ({unplanned.length})
            <ChevronRight className={`w-5 h-5 transition-transform ${unplannedOpen ? "rotate-90" : ""}`} />
          </button>
          {unplannedOpen && (
            <div className="border-t border-black">
              {unplanned.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Everything's planned. Nice.</p>
              ) : (
                unplanned.map((p) => (
                  <div key={p.id} className="p-4 border-b border-black last:border-b-0 flex flex-col gap-2">
                    <div>
                      <h3 className="font-display font-bold">{title(p)}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.content || "No content yet"}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setPlanning(p)}
                        className="px-3 py-1.5 text-xs border border-black bg-primary font-medium uppercase"
                      >
                        Pick a date
                      </button>
                      {selectedDate && (
                        <button
                          disabled={!access?.paid}
                          onClick={() => planUnplanned(p, selectedDate)}
                          className="px-3 py-1.5 text-xs border border-black bg-white hover:bg-secondary uppercase"
                        >
                          Plan for {format(selectedDate, "MMM d")}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Dialog open={choosingDay} onOpenChange={setChoosingDay}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selectedDate ? `Plan for ${format(selectedDate, "MMMM d, yyyy")}` : "Choose content"}</DialogTitle><DialogDescription>Choose existing content. Its text stays unchanged.</DialogDescription></DialogHeader>
            {!access?.paid && <p className="text-sm text-muted-foreground">Adding or moving dates requires Paid access. You can still view, edit and remove your existing dates.</p>}
            {posts.map(p => <Button key={p.id} variant="outline" disabled={!access?.paid} className="h-auto whitespace-normal justify-start text-left" onClick={() => { if (selectedDate) void planUnplanned(p, selectedDate); }}>{title(p)}</Button>)}
            {!posts.length && <p className="text-sm text-muted-foreground">No saved content yet.</p>}
          </DialogContent>
        </Dialog>

        {planning && (
          <AddToPlannerDialog
            open={!!planning}
            onOpenChange={(open) => !open && setPlanning(null)}
            postId={planning.id}
            currentDate={planning.scheduled_at}
            initialDate={selectedDate ?? undefined}
            onPlanned={fetchData}
          />
        )}
      </motion.div>
    </div>
  );
}
