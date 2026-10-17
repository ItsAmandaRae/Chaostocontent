/** One queue per authenticated user+post, shared across editor mounts. */
export function createDraftQueue(write: (id: string, text: string) => Promise<void>, storage: Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  type Entry = { text: string; saved: string; running: Promise<void> | null; timer: ReturnType<typeof setTimeout> | null; state: "idle" | "saving" | "saved" | "error"; listeners: Set<() => void> };
  const entries = new Map<string, Entry>();
  const keyFor = (user: string, id: string) => `ctc-unsaved-draft:${user}:${id}`;
  const notify = (e: Entry) => e.listeners.forEach(fn => fn());
  function open(user: string, id: string, saved: string) {
    const key = keyFor(user, id);
    let entry = entries.get(key);
    if (!entry) {
      let text = saved;
      try { const raw = storage.getItem(key); if (raw) { const recovered = JSON.parse(raw); if (typeof recovered.text === "string") text = recovered.text; } } catch { /* malformed/blocked storage */ }
      entry = { text, saved, running: null, timer: null, state: "idle", listeners: new Set() };
      entries.set(key, entry);
    }
    const e = entry;
    const backup = () => { try { if (e.text === e.saved) storage.removeItem(key); else storage.setItem(key, JSON.stringify({ text: e.text })); } catch { /* in-memory recovery remains */ } };
    const flush = (): Promise<void> => {
      if (e.timer) clearTimeout(e.timer); e.timer = null;
      if (e.running) return e.running;
      if (e.text === e.saved) return Promise.resolve();
      e.state = "saving"; notify(e);
      e.running = (async () => {
        try {
          while (e.text !== e.saved) { const text = e.text; await write(id, text); e.saved = text; backup(); }
          e.state = "saved";
        } catch { e.state = "error"; backup(); }
        finally { e.running = null; notify(e); }
      })();
      return e.running;
    };
    const edit = (text: string) => { e.text = text; e.state = "idle"; backup(); notify(e); if (e.timer) clearTimeout(e.timer); e.timer = setTimeout(() => void flush(), 900); };
    return { get: () => ({ text: e.text, state: e.state }), edit, flush, subscribe: (fn: () => void) => { e.listeners.add(fn); return () => { e.listeners.delete(fn); }; }, recovered: e.text !== saved };
  }
  return { open };
}