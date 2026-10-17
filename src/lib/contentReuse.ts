import { platformById } from "./platforms";

interface Queue { flushOrThrow: () => Promise<string>; }
export interface ReuseRequest { post: string; platform: string; text: string; copyId: string | null; }
/** Reentrant clicks share one operation; ambiguous failures retry the same copy id. */
export function createContentReuse<T>(write: (request: ReuseRequest) => Promise<T>, newId: () => string = () => crypto.randomUUID()) {
  let running: Promise<T> | null = null;
  let pending: { post: string; platform: string; copyId: string } | null = null;
  const run = (queue: Queue | null, post: string, platform: string, copy: boolean): Promise<T> => {
    if (running) return running;
    if (!queue) return Promise.reject(new Error("Wait for your content to finish loading."));
    if (!platformById(platform)) return Promise.reject(new Error("Choose a supported destination."));
    if (copy && (!pending || pending.post !== post || pending.platform !== platform)) pending = { post, platform, copyId: newId() };
    const copyId = copy ? pending?.copyId ?? null : null;
    running = (async () => {
      try {
        const text = await queue.flushOrThrow();
        const result = await write({ post, platform, text, copyId });
        if (copy) pending = null;
        return result;
      } finally { running = null; }
    })();
    return running;
  };
  return { run };
}