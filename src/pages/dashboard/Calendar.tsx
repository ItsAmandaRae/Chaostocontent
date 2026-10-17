import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Link, useOutletContext } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, List, Copy, Trash2, CheckCircle2, CalendarPlus, ExternalLink, Pencil } from "lucide-react";
import { platformLabel, formatLabel } from "@/lib/platforms";
import { shareTo } from "@/lib/share";
import { Draft } from "@/components/DraftCard";
import AddToPlannerDialog from "@/components/AddToPlannerDialog";
import BucketChips from "@/components/BucketChips";
import { Bucket, loadBuckets } from "@/lib/buckets";

export default function Calendar() {
  const { user } = useOutletContext<{ user: User | null }>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Draft[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [bucket, setBucket] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "list">("month");
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

  const bucketed = useMemo(
    () =>
      posts.filter((p) => {
        if (bucket === "unsorted") return !p.bucket_id;
        if (bucket !== "all") return p.bucket_id === bucket;
        return true;
      }),
    [posts, bucket],
  );

  const planned = bucketed.filter((p) => p.scheduled_at);
  const unplanned = bucketed.filter((p) => !p.scheduled_at && p.status !== "published");

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = startOfWeek(endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 }), { weekStartsOn: 0 });
    void end;
    return eachDayOfInterval({
      start,
      end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 }),
    });
  }, [currentMonth]);

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
      .update({ scheduled_at: day.toISOString(), status: "scheduled" })
      .eq("id", p.id);
    if (error) return toast.error("Couldn't plan that.");
    toast.success(`Planned for ${format(day, "MMMM d, yyyy")}`);
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
        initial={{ opacity: 0, y: 20 }}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("month")}
              aria-label="Month view"
              className={`p-2 border border-black ${view === "month" ? "bg-primary" : "bg-white hover:bg-secondary"}`}
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-2 border border-black ${view === "list" ? "bg-primary" : "bg-white hover:bg-secondary"}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {user && (
          <div className="mb-6">
            <BucketChips userId={user.id} buckets={buckets} active={bucket} onSelect={setBucket} onChanged={fetchData} />
          </div>
        )}

        {view === "month" ? (
          <div className="border border-black bg-white overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="flex items-center justify-between p-4 border-b border-black bg-secondary">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  aria-label="Previous month"
                  className="p-2 border border-black hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-display font-bold text-lg sm:text-xl">{format(currentMonth, "MMMM yyyy")}</h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  aria-label="Next month"
                  className="p-2 border border-black hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 border-b border-black">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                  <div key={day} className={`p-2 text-center font-display font-bold text-sm ${i < 6 ? "border-r border-black" : ""}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((day, index) => {
                  const dayPosts = postsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] p-2 border-black text-left transition-colors ${
                        index % 7 === 6 ? "" : "border-r"
                      } ${index >= days.length - 7 ? "" : "border-b"} ${
                        isCurrentMonth ? "bg-white" : "bg-muted"
                      } ${isSelected ? "bg-primary/30" : "hover:bg-secondary/50"}`}
                    >
                      <span className={`font-display font-bold text-sm ${isCurrentMonth ? "text-black" : "text-muted-foreground"}`}>
                        {format(day, "d")}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dayPosts.slice(0, 4).map((p) => (
                          <span
                            key={p.id}
                            className={`w-2 h-2 border border-black block ${p.status === "published" ? "bg-highlight" : "bg-primary"}`}
                          />
                        ))}
                        {dayPosts.length > 4 && <span className="text-xs font-medium">+{dayPosts.length - 4}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-black bg-white">
            {planned.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nothing planned yet. Pick a date on anything below, or use "Add to planner" on a piece of content.
              </div>
            ) : (
              planned.map((p) => row(p, true))
            )}
          </div>
        )}

        {selectedDate && view === "month" && (
          <div className="mt-6 border border-black bg-white p-4">
            <h3 className="font-display font-bold text-lg mb-3">{format(selectedDate, "MMMM d, yyyy")}</h3>
            {selectedDayPosts.length === 0 ? (
              <p className="text-muted-foreground">Nothing planned for this day.</p>
            ) : (
              <div className="border border-black">{selectedDayPosts.map((p) => row(p, false))}</div>
            )}
          </div>
        )}

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

        {planning && (
          <AddToPlannerDialog
            open={!!planning}
            onOpenChange={(open) => !open && setPlanning(null)}
            postId={planning.id}
            currentDate={planning.scheduled_at}
            onPlanned={fetchData}
          />
        )}
      </motion.div>
    </div>
  );
}
