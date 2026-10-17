import { usePlanAccess } from "@/lib/access";
import { Link } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  currentDate?: string | null;
  onPlanned: () => void;
}

/** Plans existing content for a date — same record, never a duplicate. */
export default function AddToPlannerDialog({ open, onOpenChange, postId, currentDate, onPlanned }: Props) {
  const { access } = usePlanAccess();
  const [date, setDate] = useState<Date | undefined>(currentDate ? new Date(currentDate) : undefined);
  const [busy, setBusy] = useState(false);

  const save = async (d: Date | undefined) => {
    setBusy(true);
    const { error } = await supabase
      .from("posts")
      .update({ scheduled_at: d ? d.toISOString() : null, status: d ? "scheduled" : "draft" })
      .eq("id", postId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(d ? `Planned for ${format(d, "MMMM d, yyyy")}` : "Removed from planner");
    onOpenChange(false);
    onPlanned();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-black rounded-none max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl">Add to planner</DialogTitle>
          <DialogDescription className="text-sm">
            Just a date so you can see it laid out — nothing posts itself.
          </DialogDescription>
        </DialogHeader>
        {!access?.paid && <p className="text-sm text-muted-foreground">Paid access is needed to add or move dates. Paid access isn't available to purchase yet. <Link className="underline" to="/demo/calendar">Explore fictional planner preview</Link></p>}
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="border border-black"
        />
        <div className="flex gap-2">
          <button
            onClick={() => save(date)}
            disabled={busy || !date || !access?.paid}
            className="flex-1 bg-primary border border-black h-11 font-medium disabled:opacity-50"
          >
            Plan for {date ? format(date, "MMM d") : "…"}
          </button>
          {currentDate && (
            <button
              onClick={() => save(undefined)}
              disabled={busy}
              className="px-4 border border-black bg-white hover:bg-secondary"
            >
              Remove date
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
