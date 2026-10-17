import { useEffect, useState } from "react";
import { format, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bucket } from "@/lib/buckets";
import { bucketColorClass, dayKey, localPlanDate, movePlanner, plannerDays, PlannerView, plannerTitle, savedPlannerView } from "@/lib/planner";
import { formatLabel, platformLabel } from "@/lib/platforms";
export interface PlannerItem { id: string; title?: string | null; content?: string | null; variant?: string | null; platform?: string | null; bucket_id?: string | null; scheduled_at?: string | null; }
interface Props { userKey: string; items: PlannerItem[]; buckets: Bucket[]; onOpen: (item: PlannerItem) => void; onDay: (day: Date) => void; }
export default function PlannerBoard({ userKey, items, buckets, onOpen, onDay }: Props) {
  const [view, setView] = useState<PlannerView>(() => savedPlannerView(userKey));
  const [anchor, setAnchor] = useState(new Date());
  const [overflowDay, setOverflowDay] = useState<Date | null>(null);
  useEffect(() => { setView(savedPlannerView(userKey)); }, [userKey]);
  const selectView = (next: PlannerView) => { setView(next); try { localStorage.setItem(`ctc-planner-view:${userKey}`, next); } catch { /* View memory is optional. */ } };
  const days = plannerDays(anchor, view);
  const forDay = (day: Date) => items.filter(item => item.scheduled_at && dayKey(localPlanDate(item.scheduled_at)) === dayKey(day));
  const bar = (item: PlannerItem, compact = true) => {
    const bucket = buckets.find(b => b.id === item.bucket_id);
    return <Button key={item.id} variant="ghost" aria-label={`${plannerTitle(item)} · ${bucket?.name ?? "Unsorted"}`} title={plannerTitle(item)} onClick={(e) => { e.stopPropagation(); onOpen(item); }} className={`w-full min-w-0 block text-left rounded-sm px-2 ${compact ? "h-8 min-h-8 max-h-8 py-1 overflow-hidden" : "h-auto whitespace-normal p-3"} ${bucketColorClass(bucket?.color)}`}>
      <span className={`block font-semibold text-sm ${compact ? "truncate" : "break-words"}`}>{plannerTitle(item)}</span>
      {!compact && <span className="block text-xs mt-1 break-words">{formatLabel(item.variant)} · {bucket?.name ?? "Unsorted"} · {platformLabel(item.platform)}</span>}
    </Button>;
  };
  return <section className="space-y-4 min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1" role="group" aria-label="Planner view">{(["week", "month", "list"] as const).map(v => <Button key={v} variant={view === v ? "default" : "outline"} aria-pressed={view === v} onClick={() => selectView(v)}>{v[0].toUpperCase() + v.slice(1)}</Button>)}</div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" aria-label={`Previous ${view === "week" ? "week" : "month"}`} onClick={() => setAnchor(movePlanner(anchor, view, -1))}><ChevronLeft /></Button>
        <Button variant="outline" onClick={() => setAnchor(new Date())}>Today</Button>
        <Button variant="outline" size="icon" aria-label={`Next ${view === "week" ? "week" : "month"}`} onClick={() => setAnchor(movePlanner(anchor, view, 1))}><ChevronRight /></Button>
      </div>
    </div>
    <h2 className="font-display text-lg">{view === "week" ? `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}` : format(anchor, "MMMM yyyy")}</h2>
    <div className={view === "list" ? "space-y-5" : "grid grid-cols-1 lg:grid-cols-7 gap-px border border-border bg-border"}>
      {days.filter(day => view !== "list" || (isSameMonth(day, anchor) && forDay(day).length > 0)).map(day => {
        const dayItems = forDay(day);
        return <section key={dayKey(day)} data-planner-day={dayKey(day)} className={`min-w-0 p-2 space-y-1 ${isSameMonth(day, anchor) || view === "week" ? "bg-background" : "bg-muted"} ${view === "list" ? "" : view === "week" ? "h-[190px] overflow-hidden" : "h-[180px] overflow-hidden"}`}>
          <Button variant="ghost" onClick={() => onDay(day)} className="w-full min-w-0 justify-start h-8 text-left px-1 py-1" aria-label={`Plan for ${format(day, "MMMM d, yyyy")}`}><time className="truncate" dateTime={dayKey(day)}>{format(day, view === "week" ? "EEE, MMM d" : "EEE d")}</time></Button>
          {dayItems.slice(0, view === "list" ? undefined : 3).map(item => bar(item, view !== "list"))}
          {view !== "list" && dayItems.length > 3 && <Button variant="ghost" className="w-full h-7 text-xs" onClick={() => setOverflowDay(day)}>+{dayItems.length - 3} more</Button>}
          {!dayItems.length && view === "week" && <p className="text-sm text-muted-foreground px-1">No plans</p>}
        </section>;
      })}
    </div>
    {view === "list" && !days.some(day => isSameMonth(day, anchor) && forDay(day).length) && <p className="text-sm text-muted-foreground">Nothing planned this month.</p>}
    <Dialog open={!!overflowDay} onOpenChange={open => !open && setOverflowDay(null)}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{overflowDay ? format(overflowDay, "MMMM d, yyyy") : "Day plans"}</DialogTitle><DialogDescription>Planned content · all buckets</DialogDescription></DialogHeader>{overflowDay && forDay(overflowDay).map(item => bar(item, false))}{overflowDay && <Button variant="outline" onClick={() => { onDay(overflowDay); setOverflowDay(null); }}>Add content to this day</Button>}</DialogContent></Dialog>
  </section>;
}
