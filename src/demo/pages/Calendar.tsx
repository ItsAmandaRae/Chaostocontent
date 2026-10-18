import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import PlannerBoard, { PlannerItem } from "@/components/PlannerBoard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bucket } from "@/lib/buckets";
import BucketLegend from "@/components/BucketLegend";
import { Input } from "@/components/ui/input";
import { BUCKET_COLORS, planDateISO, plannerTitle, bucketColorClass, bucketColorLabel, automaticBucketColor } from "@/lib/planner";
import { useSeedData } from "../SeedDataProvider";
const sampleBuckets: Bucket[] = ["Ideas", "Stories", "Offers", "Community"].map((name, i) => ({ id: `sample-${i}`, name, color: BUCKET_COLORS[i], user_id: "demo", created_at: new Date().toISOString() }));
export default function DemoCalendar() {
  const { posts, channels } = useSeedData();
  const [buckets, setBuckets] = useState(sampleBuckets);
  const [manage, setManage] = useState(false);
  const [bucketName, setBucketName] = useState("");
  const [items, setItems] = useState<PlannerItem[]>(() => posts.map((p, i) => ({ ...p, title: p.content.split(".")[0], platform: channels.find(c => c.id === p.channel_id)?.platform, variant: ["text_post", "carousel", "reel_script", "email"][i % 4], bucket_id: buckets[i % 4].id })));
  const [day, setDay] = useState<Date | null>(null);
  const [detail, setDetail] = useState<PlannerItem | null>(null);
  return <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 min-w-0">
    <h1 className="font-display font-black text-3xl">Planner preview</h1>
    <p className="text-sm text-muted-foreground">Fictional sample data · local-only changes · no automatic publishing or AI calls</p>
    <BucketLegend buckets={buckets} />
    <Button variant="ghost" size="sm" onClick={() => setManage(true)}>Manage buckets</Button>
    <Dialog open={manage} onOpenChange={setManage}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Manage buckets</DialogTitle><DialogDescription>Fictional buckets · local-only changes. All content remains visible.</DialogDescription></DialogHeader>{buckets.map(b => <div key={b.id} className="space-y-2"><Input aria-label={`Name for ${b.name}`} value={b.name} onChange={e => setBuckets(current => current.map(x => x.id === b.id ? { ...x, name: e.target.value } : x))} /><select aria-label={`Color for ${b.name}`} value={b.color} className="border border-input bg-background p-2 w-full" onChange={e => setBuckets(current => current.map(x => x.id === b.id ? { ...x, color: e.target.value } : x))}>{BUCKET_COLORS.map(c => <option key={c} value={c}>{bucketColorLabel(c)}</option>)}</select><Button variant="ghost" size="sm" onClick={() => { setBuckets(current => current.filter(x => x.id !== b.id)); setItems(current => current.map(x => x.bucket_id === b.id ? { ...x, bucket_id: null } : x)); }}>Delete {b.name}</Button></div>)}<Input aria-label="New bucket name" value={bucketName} onChange={e => setBucketName(e.target.value)} /><Button variant="outline" disabled={!bucketName.trim()} onClick={() => { setBuckets(current => [...current, { id: crypto.randomUUID(), user_id: "demo", name: bucketName.trim(), color: automaticBucketColor(current.map(b => b.color ?? "")), created_at: new Date().toISOString() }]); setBucketName(""); }}>New bucket</Button></DialogContent></Dialog>
    <PlannerBoard userKey="demo" items={items} buckets={buckets} onDay={setDay} onOpen={setDetail} />
    <details className="border-t border-border py-3"><summary className="cursor-pointer font-medium">Not planned yet ({items.filter(p => !p.scheduled_at).length})</summary>{items.filter(p => !p.scheduled_at).map(p => <Button variant="ghost" key={p.id} className="block w-full h-auto whitespace-normal text-left my-2" onClick={() => setDetail(p)}>{plannerTitle(p)}</Button>)}</details>
    <Dialog open={!!day} onOpenChange={open => !open && setDay(null)}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{day ? `Plan for ${format(day, "MMMM d, yyyy")}` : "Pick content"}</DialogTitle><DialogDescription>Choose existing fictional content. Changes stay in this demo session.</DialogDescription></DialogHeader>{items.map(p => <Button key={p.id} variant="outline" className="h-auto whitespace-normal text-left justify-start" onClick={() => { if (!day) return; setItems(items.map(item => item.id === p.id ? { ...item, scheduled_at: planDateISO(day) } : item)); setDay(null); }}>{plannerTitle(p)}</Button>)}</DialogContent></Dialog>
    <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}><DialogContent><DialogHeader><DialogTitle>{detail ? plannerTitle(detail) : "Content"}</DialogTitle><DialogDescription>Fictional sample content</DialogDescription></DialogHeader><p className="whitespace-pre-wrap">{detail?.content}</p><Button variant="outline" asChild><Link to="/demo/posts">Open Content</Link></Button><Button variant="outline" onClick={() => { if (!detail) return; setItems(items.map(p => p.id === detail.id ? { ...p, scheduled_at: null } : p)); setDetail(null); }}>Remove date — keep content</Button></DialogContent></Dialog>
  </div>;
}
