import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek, format } from "date-fns";

export type PlannerView = "week" | "month" | "list";
export const BUCKET_COLORS = ["pink", "cyan", "mint", "yellow"] as const;
export type BucketColor = typeof BUCKET_COLORS[number];
export const bucketColorClass = (color?: string | null) => ({ pink: "bucket-pink", cyan: "bucket-cyan", mint: "bucket-mint", yellow: "bucket-yellow" }[color ?? ""] ?? "bucket-neutral");
export function localPlanDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
}
export function planDateISO(day: Date): string {
  const local = new Date(day); local.setHours(12, 0, 0, 0); return local.toISOString();
}
export function plannerDays(anchor: Date, view: PlannerView): Date[] {
  return eachDayOfInterval(view === "week"
    ? { start: startOfWeek(anchor), end: endOfWeek(anchor) }
    : { start: startOfWeek(startOfMonth(anchor)), end: endOfWeek(endOfMonth(anchor)) });
}
export const movePlanner = (anchor: Date, view: PlannerView, amount: number) => view === "week" ? addWeeks(anchor, amount) : addMonths(anchor, amount);
export function savedPlannerView(user: string): PlannerView {
  try { const value = localStorage.getItem(`ctc-planner-view:${user}`); return value === "month" || value === "list" || value === "week" ? value : "week"; } catch { return "week"; }
}
export const dayKey = (day: Date) => format(day, "yyyy-MM-dd");
export function plannerTitle(item: { title?: string | null; content?: string | null }): string {
  return item.title?.trim() || item.content?.split("\n").find(line => line.trim())?.trim() || "Untitled";
}