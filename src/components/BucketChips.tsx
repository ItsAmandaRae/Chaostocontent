import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { Bucket, createBucket, renameBucket, deleteBucket } from "@/lib/buckets";
import { Input } from "@/components/ui/input";

interface Props {
  userId: string;
  buckets: Bucket[];
  /** "all" | "unsorted" | bucket id */
  active: string;
  onSelect: (key: string) => void;
  onChanged: () => void;
}

const chip = (on: boolean) =>
  `px-3 py-1.5 border border-black text-sm transition-colors ${on ? "bg-primary" : "bg-white hover:bg-secondary"}`;

export default function BucketChips({ userId, buckets, active, onSelect, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const add = async () => {
    try {
      await createBucket(userId, name);
      setName("");
      setAdding(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create that bucket.");
    }
  };

  const rename = async (id: string) => {
    try {
      await renameBucket(id, editName);
      setEditing(null);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't rename that bucket.");
    }
  };

  const remove = async (id: string, bucketName: string) => {
    try {
      await deleteBucket(id);
      if (active === id) onSelect("all");
      toast.success(`"${bucketName}" removed — its items moved to Unsorted`);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete that bucket.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => onSelect("all")} className={chip(active === "all")}>
        All
      </button>
      <button onClick={() => onSelect("unsorted")} className={chip(active === "unsorted")}>
        Unsorted
      </button>
      {buckets.map((b) =>
        editing === b.id ? (
          <span key={b.id} className="flex items-center gap-1">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && rename(b.id)}
              className="h-8 w-32 border border-black rounded-none focus-visible:ring-0 text-sm"
              autoFocus
            />
            <button onClick={() => rename(b.id)} aria-label="Save bucket name" className="p-1 border border-black bg-accent">
              <Check className="w-3.5 h-3.5" />
            </button>
          </span>
        ) : (
          <span key={b.id} className="flex items-center">
            <button onClick={() => onSelect(b.id)} className={chip(active === b.id)}>
              {b.name}
            </button>
            <button
              onClick={() => {
                setEditing(b.id);
                setEditName(b.name);
              }}
              aria-label={`Rename ${b.name}`}
              className="p-1.5 border-y border-black bg-white hover:bg-secondary"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => remove(b.id, b.name)}
              aria-label={`Delete ${b.name}`}
              className="p-1.5 border border-black bg-white hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ),
      )}
      {adding ? (
        <span className="flex items-center gap-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Bucket name"
            className="h-8 w-32 border border-black rounded-none focus-visible:ring-0 text-sm"
            autoFocus
          />
          <button onClick={add} aria-label="Create bucket" className="p-1 border border-black bg-accent">
            <Check className="w-3.5 h-3.5" />
          </button>
        </span>
      ) : (
        <button onClick={() => setAdding(true)} className="px-3 py-1.5 border border-dashed border-black text-sm bg-white hover:bg-secondary flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> New bucket
        </button>
      )}
    </div>
  );
}
