import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Bucket, createBucket, renameBucket, deleteBucket } from "@/lib/buckets";
import { BUCKET_COLORS, BucketColor, bucketColorClass, bucketColorLabel, automaticBucketColor } from "@/lib/planner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
interface Props { userId: string; buckets: Bucket[]; active: string; onSelect: (key: string) => void; onChanged: () => void; managementOnly?: boolean; }
export default function BucketChips({ userId, buckets, active, onSelect, onChanged, managementOnly = false }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<BucketColor | undefined>();
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!editing || busy) return;
    setBusy(true);
    try { if (editing === "new") await createBucket(userId, name, color); else await renameBucket(editing, name, color); setEditing(null); onChanged(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save bucket."); }
    finally { setBusy(false); }
  };
  const remove = async (b: Bucket) => {
    try { await deleteBucket(b.id); if (active === b.id) onSelect("all"); onChanged(); toast.success("Bucket removed — items moved to Unsorted"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't remove bucket."); }
  };
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      {(managementOnly ? buckets : [{ id: "all", name: "All" }, { id: "unsorted", name: "Unsorted" }, ...buckets]).map(b => <span className="inline-flex items-center max-w-full" key={b.id}>
        {managementOnly ? <span className={`px-2 py-1 text-sm break-words ${bucketColorClass("color" in b ? b.color : null)}`}>{b.name}</span> : <Button variant="outline" size="sm" aria-pressed={active === b.id} onClick={() => onSelect(b.id)} className={`max-w-full whitespace-normal ${bucketColorClass("color" in b ? b.color : null)} ${active === b.id ? "ring-2 ring-ring ring-offset-2" : ""}`}>{b.name}</Button>}
        {"user_id" in b && <>
          <Button variant="ghost" size="icon" aria-label={`Edit ${b.name} bucket`} title="Edit name and color" onClick={() => { setEditing(b.id); setName(b.name); setColor(BUCKET_COLORS.find(c => c === b.color)); }}><Pencil /></Button>
          <Button variant="ghost" size="icon" aria-label={`Delete ${b.name}`} title="Delete bucket" onClick={() => remove(b)}><Trash2 /></Button>
        </>}
      </span>)}
      <Button variant="outline" size="sm" onClick={() => { setEditing("new"); setName(""); setColor(undefined); }}><Plus />New bucket</Button>
    </div>
    {editing && <form className="flex flex-wrap gap-2 items-center" onSubmit={e => { e.preventDefault(); void save(); }}>
      <Input aria-label="Bucket name" value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Bucket name" className="w-48" autoFocus />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Bucket color (optional)">
        {editing === "new" && <Button type="button" variant="outline" size="sm" aria-pressed={!color} onClick={() => setColor(undefined)}>Automatic ({bucketColorLabel(automaticBucketColor(buckets.map(b => b.color ?? "")))})</Button>}
        {BUCKET_COLORS.map(c => <Button type="button" key={c} variant="outline" size="sm" aria-label={`${c} bucket color`} aria-pressed={color === c} onClick={() => setColor(c)} className={`${bucketColorClass(c)} ${color === c ? "ring-2 ring-ring ring-offset-2" : ""}`}>{color === c && <Check className="h-3 w-3" />}{bucketColorLabel(c)}</Button>)}
      </div>
      <Button type="submit" variant="outline" disabled={busy || !name.trim()} aria-label="Save bucket"><Check />Save</Button>
      <Button type="button" variant="ghost" size="icon" aria-label="Cancel bucket edit" onClick={() => setEditing(null)}><X /></Button>
    </form>}
  </div>;
}
