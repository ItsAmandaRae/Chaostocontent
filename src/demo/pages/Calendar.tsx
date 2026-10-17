import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import PlannerBoard, { PlannerItem } from "@/components/PlannerBoard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bucket } from "@/lib/buckets";
import { BUCKET_COLORS, planDateISO, plannerTitle, bucketColorClass } from "@/lib/planner";
import { useSeedData } from "../SeedDataProvider";
const buckets: Bucket[] = ["Ideas", "Stories", "Offers", "Community"].map((name, i) => ({ id: `sample-${i}`, name, color: BUCKET_COLORS[i], user_id: "demo", created_at: new Date().toISOString() }));
export default function DemoCalendar() {
  const { posts, channels } = useSeedData();
  const [items, setItems] = useState<PlannerItem[]>(() => posts.map((p, i) => ({ ...p, title: p.content.split(".")[0], platform: channels.find(c => c.id === p.channel_id)?.platform, variant: ["text_post", "carousel", "reel_script", "email"][i % 4], bucket_id: buckets[i % 4].id })));
  const [active, setActive] = useState("all");
  const [day, setDay] = useState<Date | null>(null);
  const [detail, setDetail] = useState<PlannerItem | null>(null);
  return <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-w-0">
    <h1 className="font-display font-black text-3xl">Planner preview</h1>
    <p className="text-sm text-muted-foreground">Fictional sample data · local-only changes · no automatic publishing or AI calls</p>
    <div className="flex flex-wrap gap-2"><Button variant="outline" aria-pressed={active === "all"} onClick={() => setActive("all")}>All</Button>{buckets.map(b => <Button key={b.id} variant="outline" className={bucketColorClass(b.color)} aria-pressed={active === b.id} onClick={() => setActive(b.id)}>{b.name}</Button>)}</div>
    <PlannerBoard userKey="demo" items={items.filter(p => active === "all" || p.bucket_id === active)} buckets={buckets} onDay={setDay} onOpen={setDetail} />
    <Dialog open={!!day} onOpenChange={open => !open && setDay(null)}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{day ? `Plan for ${format(day, "MMMM d, yyyy")}` : "Pick content"}</DialogTitle><DialogDescription>Choose existing fictional content. Changes stay in this demo session.</DialogDescription></DialogHeader>{items.map(p => <Button key={p.id} variant="outline" className="h-auto whitespace-normal text-left justify-start" onClick={() => { if (!day) return; setItems(items.map(item => item.id === p.id ? { ...item, scheduled_at: planDateISO(day) } : item)); setDay(null); }}>{plannerTitle(p)}</Button>)}</DialogContent></Dialog>
    <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}><DialogContent><DialogHeader><DialogTitle>{detail ? plannerTitle(detail) : "Content"}</DialogTitle><DialogDescription>Fictional sample content</DialogDescription></DialogHeader><p className="whitespace-pre-wrap">{detail?.content}</p><Button variant="outline" asChild><Link to="/demo/posts">Open Content</Link></Button><Button variant="outline" onClick={() => { if (!detail) return; setItems(items.map(p => p.id === detail.id ? { ...p, scheduled_at: null } : p)); setDetail(null); }}>Remove date — keep content</Button></DialogContent></Dialog>
  </div>;
}
