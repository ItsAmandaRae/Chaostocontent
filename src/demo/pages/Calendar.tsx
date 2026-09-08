import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, List, Plus, Trash2, Pencil, Send } from "lucide-react";
import { platformLabel } from "@/lib/platforms";
import { useSeedData } from "../SeedDataProvider";
import { DemoPost } from "../seedData";

export default function DemoCalendar() {
  const { posts, projects, channels, removePost } = useSeedData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<"month" | "list">("month");

  const projectTitle = (id: string) => projects.find((p) => p.id === id)?.title || "Untitled";

  const channelLabel = (id: string | null) => {
    if (!id) return null;
    const channel = channels.find((c) => c.id === id);
    if (!channel) return null;
    return `${platformLabel(channel.platform)}${channel.handle ? ` · @${channel.handle}` : ""}`;
  };

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const postsForDay = (day: Date) =>
    posts.filter((p) => {
      const date = p.scheduled_at ? new Date(p.scheduled_at) : p.published_at ? new Date(p.published_at) : null;
      return date ? isSameDay(date, day) : false;
    });

  const selectedDayPosts = selectedDate ? postsForDay(selectedDate) : [];

  const statusDot = (status: string) => {
    const color = status === "published" ? "bg-highlight" : status === "scheduled" ? "bg-primary" : "bg-secondary";
    return <span className={`w-2 h-2 ${color} border border-black block`} />;
  };

  const sortedPosts = [...posts].sort((a, b) => {
    const da = new Date(a.scheduled_at ?? a.published_at ?? a.created_at).getTime();
    const db = new Date(b.scheduled_at ?? b.published_at ?? b.created_at).getTime();
    return db - da;
  });

  const PostActions = ({ post }: { post: DemoPost }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toast.info("Publishing is disabled in the demo")}
        aria-label="Publish post"
        className="p-1.5 border border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
      <button
        onClick={() => toast.info("Editing is disabled in the demo")}
        aria-label="Edit post"
        className="p-1.5 border border-black hover:bg-secondary transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          removePost(post.id);
          toast.success("Removed from this demo session");
        }}
        aria-label="Delete post"
        className="p-1.5 border border-black text-destructive hover:bg-destructive hover:text-white transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="font-display font-black text-2xl sm:text-3xl leading-tight tracking-[-0.5px] text-foreground">
            Content Calendar
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("month")}
              className={`p-2 border border-black ${view === "month" ? "bg-primary" : "bg-white hover:bg-secondary"}`}
              aria-label="Month view"
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 border border-black ${view === "list" ? "bg-primary" : "bg-white hover:bg-secondary"}`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => toast.info("Scheduling is disabled in the demo")}
              className="ml-2 bg-highlight text-highlight-foreground border border-black h-10 px-4 rounded-full text-sm font-medium shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_3px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 ease-out flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Schedule Post
            </button>
          </div>
        </div>

        {view === "month" ? (
          <div className="border border-black bg-white">
            <div className="flex items-center justify-between p-4 border-b border-black bg-secondary">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 border border-black hover:bg-white transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-display font-bold text-lg sm:text-xl">{format(currentMonth, "MMMM yyyy")}</h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 border border-black hover:bg-white transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-black">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <div
                  key={day}
                  className={`p-2 text-center font-display font-bold text-sm ${i < 6 ? "border-r border-black" : ""}`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr">
              {days.map((day, index) => {
                const dayPosts = postsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isLastColumn = index % 7 === 6;
                const isLastRow = index >= days.length - 7;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[100px] p-2 border-black text-left transition-colors ${
                      isLastColumn ? "" : "border-r"
                    } ${isLastRow ? "" : "border-b"} ${isCurrentMonth ? "bg-white" : "bg-muted"} ${
                      isSelected ? "bg-primary/30" : "hover:bg-secondary/50"
                    }`}
                  >
                    <span
                      className={`font-display font-bold text-sm ${
                        isCurrentMonth ? "text-black" : "text-muted-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dayPosts.slice(0, 4).map((p) => (
                        <span key={p.id}>{statusDot(p.status)}</span>
                      ))}
                      {dayPosts.length > 4 && <span className="text-xs font-medium">+{dayPosts.length - 4}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border border-black bg-white">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 border-b border-black last:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <h3 className="font-display font-bold">{projectTitle(post.project_id)}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                  {channelLabel(post.channel_id) && (
                    <p className="text-xs mt-1 font-medium uppercase tracking-wide">{channelLabel(post.channel_id)}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {post.scheduled_at
                      ? format(new Date(post.scheduled_at), "MMM d, yyyy")
                      : post.published_at
                      ? format(new Date(post.published_at), "MMM d, yyyy")
                      : "Draft"}
                  </span>
                  <span className="px-2 py-1 text-xs border border-black font-medium uppercase">{post.status}</span>
                  <PostActions post={post} />
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedDate && view === "month" && (
          <div className="mt-6 border border-black bg-white p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display font-bold text-lg">{format(selectedDate, "MMMM d, yyyy")}</h3>
              <button
                onClick={() => toast.info("Scheduling is disabled in the demo")}
                className="px-3 py-1 text-sm border border-black bg-primary font-medium hover:bg-primary/80 transition-colors"
              >
                Schedule here
              </button>
            </div>
            {selectedDayPosts.length === 0 ? (
              <p className="text-muted-foreground">No posts scheduled for this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedDayPosts.map((post) => (
                  <div key={post.id} className="p-3 border border-black flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display font-bold">{projectTitle(post.project_id)}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{post.content}</p>
                      {channelLabel(post.channel_id) && (
                        <p className="text-xs mt-1 font-medium uppercase tracking-wide">
                          {channelLabel(post.channel_id)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs border border-black font-medium uppercase">{post.status}</span>
                      <PostActions post={post} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
