import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { chatText, HttpError, parseJson, transcribe } from "../_shared/ai.ts";
import { userClient } from "../_shared/auth.ts";

const BodySchema = z.object({ dumpId: z.string().uuid() });

interface Meta {
  title: string;
  summary: string;
  tags: string[];
}

async function makeMeta(text: string): Promise<Meta> {
  const raw = await chatText([
    {
      role: "system",
      content:
        "You organise messy idea notes for people with ADHD. Reply with JSON only, shape " +
        '{"title": string, "summary": string, "tags": string[]}. ' +
        "The title is at most 8 words and names the idea. The summary is 1-2 short plain sentences that " +
        "capture the usable insight, written so it is instantly re-readable later. Give 2-5 lowercase " +
        "one-or-two-word tags. Never invent facts that are not in the note.",
    },
    { role: "user", content: text.slice(0, 20000) },
  ]);

  const parsed = parseJson<Partial<Meta>>(raw);
  const words = text.trim().split(/\s+/).slice(0, 8).join(" ");
  return {
    title: (typeof parsed?.title === "string" && parsed.title.trim()
      ? parsed.title.trim()
      : words || "Untitled idea").slice(0, 120),
    summary: (typeof parsed?.summary === "string" ? parsed.summary.trim() : "").slice(0, 600),
    tags: Array.isArray(parsed?.tags)
      ? parsed!.tags!.filter((t): t is string => typeof t === "string").map((t) => t.toLowerCase().trim().slice(0, 30)).filter(Boolean).slice(0, 5)
      : [],
  };
}

async function readImage(signedUrl: string): Promise<string> {
  const raw = await chatText([
    {
      role: "user",
      content: [
        {
          type: "text",
          text:
            "Read this screenshot or photo. Write out every piece of text you can read, then on a new line " +
            'starting with "IDEA:" say in one sentence what the idea or takeaway is. No other commentary.',
        },
        { type: "image_url", image_url: { url: signedUrl } },
      ],
    },
  ]);
  return raw.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let dumpId: string | null = null;
  let client: Awaited<ReturnType<typeof userClient>> | null = null;

  try {
    client = await userClient(req);
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Missing or invalid dump id." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    dumpId = parsed.data.dumpId;
    const { supabase, userId } = client;

    const { data: dump, error } = await supabase
      .from("dumps")
      .select("*")
      .eq("id", dumpId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new HttpError(500, "Could not load that idea.");
    if (!dump) throw new HttpError(404, "That idea no longer exists.");

    await supabase
      .from("dumps")
      .update({ processing_state: "processing", processing_error: null })
      .eq("id", dumpId)
      .eq("user_id", userId);

    let text: string = (dump.raw_text ?? "").trim();

    if (dump.kind === "audio" && dump.file_path && !text) {
      const { data: file, error: dlError } = await supabase.storage
        .from("recordings")
        .download(dump.file_path);
      if (dlError || !file) throw new HttpError(422, "We couldn't open that audio file.");
      if (file.size > 14 * 1024 * 1024) {
        throw new HttpError(413, "That recording is too long to transcribe — try one under about 15 MB.");
      }
      text = await transcribe(file, dump.file_mime);
    }

    if (dump.kind === "image" && dump.file_path) {
      const { data: signed, error: signError } = await supabase.storage
        .from("dumps")
        .createSignedUrl(dump.file_path, 600);
      if (signError || !signed?.signedUrl) throw new HttpError(422, "We couldn't open that image.");
      const read = await readImage(signed.signedUrl);
      text = [text, read].filter(Boolean).join("\n\n").trim();
    }

    if (dump.kind === "link" && dump.link_url && !text) {
      text = `Saved link: ${dump.link_url}`;
    }

    if (!text) throw new HttpError(422, "There was nothing to read in that dump.");

    const meta = await makeMeta(text);

    const { error: updateError } = await supabase
      .from("dumps")
      .update({
        raw_text: text,
        title: meta.title,
        summary: meta.summary,
        tags: meta.tags,
        processing_state: "done",
        processing_error: null,
      })
      .eq("id", dumpId)
      .eq("user_id", userId);
    if (updateError) throw new HttpError(500, "Could not save what we read.");

    return new Response(JSON.stringify({ ok: true, ...meta, raw_text: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Something went wrong.";
    if (client && dumpId) {
      await client.supabase
        .from("dumps")
        .update({ processing_state: "error", processing_error: message.slice(0, 500) })
        .eq("id", dumpId)
        .eq("user_id", client.userId);
    }
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
