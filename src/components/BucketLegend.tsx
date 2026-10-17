import { Bucket } from "@/lib/buckets";
import { bucketColorClass } from "@/lib/planner";
export default function BucketLegend({ buckets }: { buckets: Bucket[] }) {
  return <section aria-label="Bucket color legend" className="space-y-2">
    <p className="text-sm font-medium">All buckets shown together</p>
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      {[{ id: "unsorted", name: "Unsorted", color: null }, ...buckets].map(b => <li key={b.id} className="flex items-center gap-2 min-w-0"><span aria-hidden="true" className={`w-3 h-3 shrink-0 border border-border ${bucketColorClass(b.color)}`} /><span className="break-words">{b.name}</span></li>)}
    </ul>
  </section>;
}