import { useEffect, useState } from "react";
import { addDays, addMonths, format, isSameDay, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bucket } from "@/lib/buckets";
import { bucketColorClass, dayKey, localPlanDate, movePlanner, plannerDays, PlannerView, plannerTitle, savedPlannerView } from "@/lib/planner";
import { formatLabel, platformLabel } from "@/lib/platforms";
// Compact (7-column mini) layout must match the desktop grid's lg (1024px) breakpoint,
// so tablets at 768-1023px get the compact grid instead of giant stacked days.
function useCompactPlanner() {
  const [compact, setCompact] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return compact;
}
export interface PlannerItem { id: string; title?: string | null; content?: string | null; variant?: string | null; platform?: string | null; bucket_id?: string | null; scheduled_at?: string | null; }
interface Props { userKey: string; items: PlannerItem[]; buckets: Bucket[]; onOpen: (item: PlannerItem) => void; onDay: (day: Date) => void; }
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export default function PlannerBoard({ userKey, items, buckets, onOpen, onDay }: Props) {
  const isCompact = useCompactPlanner();
  const [view, setView] = useState<PlannerView>(() => savedPlannerView(userKey));
  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [overflowDay, setOverflowDay] = useState<Date | null>(null);
  useEffect(() => { setView(savedPlannerView(userKey)); }, [userKey]);
  const selectView = (next: PlannerView) => { setView(next); setAnchor(selected); try { localStorage.setItem(`ctc-planner-view:${userKey}`, next); } catch { /* View memory is optional. */ } };
  // Move the anchor and the selected day together so the selected-day panel stays in the visible period.
  const shift = (dir: 1 | -1) => {
    setAnchor(movePlanner(anchor, view, dir));
    setSelected(day => view === "week" ? addDays(day, dir * 7) : addMonths(day, dir));
  };
  const days = plannerDays(anchor, view);
  const forDay = (day: Date) => items.filter(item => item.scheduled_at && dayKey(localPlanDate(item.scheduled_at)) === dayKey(day));
  const bar = (item: PlannerItem, compact = true) => {
    const bucket = buckets.find(b => b.id === item.bucket_id);
    return <Button key={item.id} variant="ghost" aria-label={`${plannerTitle(item)} · ${bucket?.name ?? "Unsorted"}`} title={plannerTitle(item)} onClick={(e) => { e.stopPropagation(); onOpen(item); }} className={`w-full min-w-0 block text-left rounded-sm px-2 ${compact ? "h-8 min-h-8 max-h-8 py-1 overflow-hidden" : "h-auto whitespace-normal p-3"} ${bucketColorClass(bucket?.color)}`}>
      <span className={`block font-semibold text-sm ${compact ? "truncate" : "break-words"}`}>{plannerTitle(item)}</span>
      {!compact && <span className="block text-xs mt-1 break-words">{formatLabel(item.variant)} · {bucket?.name ?? "Unsorted"} · {platformLabel(item.platform)}</span>}
    </Button>;
  };
  // Small visible bucket-colored bars (not dots) for compact mobile cells.
  const miniBars = (dayItems: PlannerItem[], max: number) => (
    <span className="block w-full space-y-0.5 mt-0.5" aria-hidden="true">
      {dayItems.slice(0, max).map(item => <span key={item.id} className={`block h-1.5 w-full rounded-sm ${bucketColorClass(buckets.find(b => b.id === item.bucket_id)?.color)}`} />)}
    </span>
  );
  const dayState = (day: Date) => {
    const isSel = isSameDay(day, selected);
    const today = isToday(day);
    return {
      isSel, today,
      className: `${isSel ? "ring-2 ring-foreground ring-inset" : ""} ${today ? "font-black underline decoration-2 underline-offset-2" : ""}`,
      props: { "aria-pressed": isSel, ...(today ? { "aria-current": "date" as const } : {}) },
    };
  };
  const selectedItems = forDay(selected);
  const selectedPanel = (
    <section aria-label={`Content planned for ${format(selected, "MMMM d, yyyy")}`} className="border border-border rounded-md p-3 space-y-2">
      <h3 className="font-display font-bold">{format(selected, "EEEE, MMMM d, yyyy")}{isToday(selected) && <span className="ml-2 text-xs font-body font-normal text-muted-foreground">Today</span>}</h3>
      {selectedItems.length === 0 && <p className="text-sm text-muted-foreground">Nothing planned this day.</p>}
      {selectedItems.map(item => bar(item, false))}
      <Button variant="outline" className="w-full" onClick={() => onDay(selected)}><Plus className="w-4 h-4" /> Add content to this day</Button>
    </section>
  );
  const mobileMonth = (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-px border border-border bg-border">
        {WEEKDAYS.map(d => <div key={d} className="bg-muted text-center text-xs font-semibold py-1">{d}</div>)}
        {days.map(day => {
          const dayItems = forDay(day);
          const state = dayState(day);
          return <button key={dayKey(day)} type="button" {...state.props} onClick={() => setSelected(day)} aria-label={`${format(day, "MMMM d, yyyy")}${dayItems.length ? `, ${dayItems.length} planned` : ""}`} className={`min-w-0 h-14 p-1 text-left text-xs ${isSameMonth(day, anchor) ? "bg-background" : "bg-muted text-muted-foreground"} ${state.className}`}>
            <span className="block">{format(day, "d")}</span>
            {miniBars(dayItems, 2)}
            {dayItems.length > 2 && <span className="block text-[10px] leading-tight">+{dayItems.length - 2}</span>}
          </button>;
        })}
      </div>
      {selectedPanel}
    </div>
  );
  const mobileWeek = (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayItems = forDay(day);
          const state = dayState(day);
          return <button key={dayKey(day)} type="button" {...state.props} onClick={() => setSelected(day)} aria-label={`${format(day, "EEEE, MMMM d")}${dayItems.length ? `, ${dayItems.length} planned` : ""}`} className={`min-w-0 rounded-md border border-border p-1.5 text-center text-xs bg-background ${state.className}`}>
            <span className="block text-[10px] text-muted-foreground">{format(day, "EEE")}</span>
            <span className="block">{format(day, "d")}</span>
            {miniBars(dayItems, 3)}
          </button>;
        })}
      </div>
      {selectedPanel}
    </div>
  );
  const desktopGrid = (
    <div className={view === "list" ? "space-y-5" : "grid grid-cols-1 lg:grid-cols-7 gap-px border border-border bg-border"}>
      {days.filter(day => view !== "list" || (isSameMonth(day, anchor) && forDay(day).length > 0)).map(day => {
        const dayItems = forDay(day);
        const state = dayState(day);
        return <section key={dayKey(day)} data-planner-day={dayKey(day)} className={`min-w-0 p-2 space-y-1 ${isSameMonth(day, anchor) || view === "week" ? "bg-background" : "bg-muted"} ${view === "list" ? "" : view === "week" ? "h-[190px] overflow-hidden" : "h-[180px] overflow-hidden"}`}>
          <Button variant="ghost" {...state.props} onClick={() => setSelected(day)} className={`w-full min-w-0 justify-start h-8 text-left px-1 py-1 ${state.className}`} aria-label={`Select ${format(day, "MMMM d, yyyy")}`}><time className="truncate" dateTime={dayKey(day)}>{format(day, view === "week" ? "EEE, MMM d" : "EEE d")}</time></Button>
          {dayItems.slice(0, view === "list" ? undefined : 3).map(item => bar(item, view !== "list"))}
          {view !== "list" && dayItems.length > 3 && <Button variant="ghost" className="w-full h-7 text-xs" onClick={() => setOverflowDay(day)}>+{dayItems.length - 3} more</Button>}
          {!dayItems.length && view === "week" && <p className="text-sm text-muted-foreground px-1">No plans</p>}
        </section>;
      })}
    </div>
  );
  return <section className="space-y-4 min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-1" role="group" aria-label="Planner view">{(["week", "month", "list"] as const).map(v => <Button key={v} variant={view === v ? "default" : "outline"} aria-pressed={view === v} onClick={() => selectView(v)}>{v[0].toUpperCase() + v.slice(1)}</Button>)}</div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" aria-label={`Previous ${view === "week" ? "week" : "month"}`} onClick={() => setAnchor(movePlanner(anchor, view, -1))}><ChevronLeft /></Button>
        <Button variant="outline" onClick={() => { const now = new Date(); setAnchor(now); setSelected(now); }}>Today</Button>
        <Button variant="outline" size="icon" aria-label={`Next ${view === "week" ? "week" : "month"}`} onClick={() => setAnchor(movePlanner(anchor, view, 1))}><ChevronRight /></Button>
      </div>
    </div>
    <h2 className="font-display text-lg">{view === "week" ? `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}` : format(anchor, "MMMM yyyy")}</h2>
    {isMobile && view === "month" ? mobileMonth : isMobile && view === "week" ? mobileWeek : desktopGrid}
    {!isMobile && view !== "list" && selectedPanel}
    {view === "list" && !days.some(day => isSameMonth(day, anchor) && forDay(day).length) && <p className="text-sm text-muted-foreground">Nothing planned this month.</p>}
    <Dialog open={!!overflowDay} onOpenChange={open => !open && setOverflowDay(null)}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{overflowDay ? format(overflowDay, "MMMM d, yyyy") : "Day plans"}</DialogTitle><DialogDescription>Planned content · all buckets</DialogDescription></DialogHeader>{overflowDay && forDay(overflowDay).map(item => bar(item, false))}{overflowDay && <Button variant="outline" onClick={() => { onDay(overflowDay); setOverflowDay(null); }}>Add content to this day</Button>}</DialogContent></Dialog>
  </section>;
}
