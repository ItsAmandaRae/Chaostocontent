import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

const samples = [
  { id: "batch", title: "Sunday batching", text: "One messy voice note. Three useful posts. I keep the idea before I worry about the wording." },
  { id: "pause", title: "A pause is not a failure", text: "My best ideas rarely arrive when I sit down to write. Today I'm keeping a little space for them." },
];
export default function DemoContent() {
  const [items, setItems] = useState(samples);
  return <div className="p-4 sm:p-8 space-y-5 max-w-4xl"><h1 className="font-display text-3xl font-bold">Content</h1>
    <p className="text-sm text-muted-foreground">Fictional sample content · edits stay in this page only · no AI calls</p>
    {items.map(item => <article key={item.id} className="border border-border p-4 space-y-3 bg-background"><h2 className="font-display font-bold">{item.title}</h2><Textarea aria-label={item.title} value={item.text} onChange={e => setItems(prev => prev.map(p => p.id === item.id ? { ...p, text: e.target.value } : p))} /><Button variant="outline" onClick={() => void navigator.clipboard.writeText(item.text)}>Copy</Button></article>)}
    <Link className="underline" to="/demo/calendar">Explore planner preview</Link>
  </div>;
}