import { usePlanAccess } from "@/lib/access";

export default function AllowanceNote({ media = false }: { media?: boolean }) {
  const { access, error } = usePlanAccess();
  return <p className="text-sm text-muted-foreground" aria-live="polite">
    {error ? "Couldn't check your allowance. Try again before using AI." : !access ? "Checking allowance…" : media
      ? `Audio or screenshot reading: 1 read per file · ${access.media_remaining} reads remaining this month. Original files save even when reads run out. Audio: 25 MB max. Images: 20 MB max.`
      : `Each idea extraction, content item or rewrite suggestion costs 1 creation · ${access.creations_remaining} remaining this month. Failed actions cost nothing.`}
  </p>;
}