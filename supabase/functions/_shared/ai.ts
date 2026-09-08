export const GATEWAY = "https://ai.gateway.lovable.dev/v1";
export const CHAT_MODEL = "openai/gpt-6-astra";

export function gatewayKey() {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new HttpError(500, "AI is not configured for this project yet.");
  return key;
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function friendly(status: number, body: string) {
  if (status === 402) return "This workspace is out of AI credits. Add credits to keep generating.";
  if (status === 403) return "AI access is blocked for this workspace.";
  if (status === 429) return "The AI is busy right now — try again in a moment.";
  if (status >= 500) return "The AI service had a hiccup — try again.";
  return `AI request failed (${status}). ${body.slice(0, 300)}`;
}

/** Streams a chat completion and returns the full text. */
export async function chatText(
  messages: unknown[],
  opts: { reasoning_effort?: string } = {},
): Promise<string> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      stream: true,
      reasoning_effort: opts.reasoning_effort ?? "low",
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new HttpError(res.status || 500, friendly(res.status || 500, body));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let out = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") out += delta;
      } catch {
        // ignore keep-alives / partial frames
      }
    }
  }

  return out;
}

/** Parses JSON out of a model response, tolerating code fences and stray prose. */
export function parseJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, "```").trim();
  const candidates: string[] = [];
  const fenced = cleaned.match(/```([\s\S]*?)```/);
  if (fenced) candidates.push(fenced[1]);
  candidates.push(cleaned);
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(cleaned.slice(firstBrace, lastBrace + 1));
  }
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate.trim()) as T;
    } catch {
      continue;
    }
  }
  return null;
}

/** Transcribes an audio file via the gateway speech-to-text endpoint. */
export async function transcribe(bytes: Blob, mime: string | null): Promise<string> {
  const extByMime: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
    "audio/m4a": "m4a",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/flac": "flac",
    "audio/aac": "aac",
    "audio/ogg": "ogg",
  };
  const base = (mime ?? "").split(";")[0].toLowerCase();
  const ext = extByMime[base] ?? "mp3";

  const form = new FormData();
  form.append("model", "google/gemini-3.5-transcribe");
  form.append("file", bytes, `recording.${ext}`);

  const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${gatewayKey()}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new HttpError(res.status || 500, friendly(res.status || 500, body));
  }
  const json = await res.json().catch(() => null);
  const text = json?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new HttpError(422, "We couldn't hear any speech in that recording.");
  }
  return text.trim();
}
