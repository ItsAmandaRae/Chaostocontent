import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DemoBanner({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-black bg-secondary p-4 mb-6 flex gap-3 items-start">
      <div className="w-8 h-8 shrink-0 border border-black bg-primary flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-black" />
      </div>
      <div>
        <p className="font-display font-bold text-sm mb-1">{title}</p>
        <div className="text-sm text-muted-foreground space-y-1">{children}</div>
      </div>
    </div>
  );
}

export function NotWiredModal({
  open,
  onOpenChange,
  title,
  summary,
  steps,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  summary: string;
  steps: string[];
  footer?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-xl">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{summary}</p>

        <div className="border border-black bg-secondary p-4">
          <p className="font-display font-bold text-sm mb-2 uppercase tracking-wide">
            How this works
          </p>

          <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        {footer}
      </DialogContent>
    </Dialog>
  );
}
