import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { chatText, HttpError, parseJson } from "../_shared/ai.ts";
import { userClient } from "../_shared/auth.ts";
import { PLATFORMS, platformById } from "../_shared/platforms.ts";

const platformIds = PLATFORMS.map((p) => p.id);

const BodySchema = z.union([
  z.object({
    mode: z.literal("create"),
    dumpIds: z.array(z.string().uuid()).min(1).max(5),
    platforms: z.array(z.enum(platformIds as [string, ...string[]])).min(1).max(8),
    notes: z.string().max(500).optional(),
  }),
  z.object({
    mode: z.literal("regenerate"),
    postId: z.string().uuid(),
    notes: z.string().max(500).optional(),
  }),
]);

interface BrandProfile {
  what_you_do: string | null;
  audience: string | null;
  audience_problem: string | null;
  tone_traits: string[] | null;
  voice_samples: string[] | null;
  banned_words: string[] | null;
  offers: string | null;
  links: string | null;
  cta_style: string | null;
}

function brandBlock(brand: BrandProfile | null) {
  if (!brand) return "The user has not filled in their brand profile yet. Write in a natural, human, specific voice.";
  const lines: string[] = [];
  if (brand.what_you_do) lines.push(`What they do: ${brand.what_you_do}`);
  if (brand.audience) lines.push(`Audience: ${brand.audience}`);
  if (brand.audience_problem) lines.push(`Audience's problem: ${brand.audience_problem}`);
  if (brand.tone_traits?.length) lines.push(`Tone: ${brand.tone_traits.join(", ")}`);
  if (brand.offers) lines.push(`Offers: ${brand.offers}`);
  if (brand.links) lines.push(`Links: ${brand.links}`);
  if (brand.cta_style) lines.push(`How they like to ask for action: ${brand.cta_style}`);
  if (brand.banned_words?.length) lines.push(`NEVER use these words or phrases: ${brand.banned_words.join(", ")}`);
  if (brand.voice_samples?.length) {
    lines.push(
      "Posts written in their real voice — match this rhythm, vocabulary and level of formality closely:\n" +
        brand.voice_samples.slice(0, 5).map((s, i) => `--- sample ${i + 1} ---\n${s.slice(0, 1500)}`).join("\n"),
    );
  }
  return lines.join("\n");
}

const SYSTEM =
  "You are a ghostwriter who writes social content in the user's own voice from their raw, messy notes. " +
  "Rules: keep the specific details, numbers and phrasing from the note — those are the golden nuggets. " +
  "Never invent facts, results, clients or statistics. No em-dashes. No 'in today's fast-paced world', " +
  "no 'game-changer', no 'unlock', no 'dive in', no hollow hype. Sound like a person talking, not a brand.";

function clamp(text: string, limit: number | null) {
  const trimmed = text.trim();
  if (limit === null || trimmed.length <= limit) return trimmed;
  const cut = trimmed.slice(0, limit);
  const lastBreak = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return (lastBreak > limit * 0.6 ? cut.slice(0, lastBreak) : cut).trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { supabase, userId } = await userClient(req);
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "That request wasn't valid." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = parsed.data;

    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("what_you_do, audience, audience_problem, tone_traits, voice_samples, banned_words, offers, links, cta_style")
      .eq("user_id", userId)
      .maybeSingle();

    // ---- regenerate one draft -------------------------------------------------
    if (body.mode === "regenerate") {
      const { data: post } = await supabase
        .from("posts")
        .select("id, content, platform, dump_id, prompt_notes")
        .eq("id", body.postId)
        .eq("user_id", userId)
        .maybeSingle();
      if (!post) throw new HttpError(404, "That draft no longer exists.");

      const spec = platformById(post.platform ?? "") ?? PLATFORMS[0];
      let source = "";
      if (post.dump_id) {
        const { data: dump } = await supabase
          .from("dumps")
          .select("title, raw_text, summary")
          .eq("id", post.dump_id)
          .eq("user_id", userId)
          .maybeSingle();
        source = [dump?.title, dump?.summary, dump?.raw_text].filter(Boolean).join("\n\n");
      }

      const text = await chatText([
        { role: "system", content: `${SYSTEM}\n\nBRAND PROFILE\n${brandBlock(brand as BrandProfile | null)}` },
        {
          role: "user",
          content:
            `Rewrite this ${spec.label} draft. ${spec.brief}\n` +
            (spec.limit ? `Hard limit: ${spec.limit} characters.\n` : "") +
            `Change requested: ${body.notes?.trim() || "make it stronger and more specific"}\n\n` +
            `ORIGINAL NOTE\n${source || "(not available)"}\n\nCURRENT DRAFT\n${post.content ?? ""}\n\n` +
            "Reply with the rewritten draft text only, no preamble and no quotes around it.",
        },
      ]);

      const content = clamp(text, spec.limit);
      if (!content) throw new HttpError(502, "The AI came back empty — try again.");

      const { error } = await supabase
        .from("posts")
        .update({ content, char_count: content.length, prompt_notes: body.notes ?? null })
        .eq("id", post.id)
        .eq("user_id", userId);
      if (error) throw new HttpError(500, "Could not save the new draft.");

      return new Response(JSON.stringify({ ok: true, content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- create drafts from dumps --------------------------------------------
    const { data: dumps } = await supabase
      .from("dumps")
      .select("id, title, raw_text, summary")
      .in("id", body.dumpIds)
      .eq("user_id", userId);
    if (!dumps?.length) throw new HttpError(404, "We couldn't find those ideas.");

    const source = dumps
      .map((d) => `--- idea: ${d.title} ---\n${d.summary ? `${d.summary}\n\n` : ""}${d.raw_text ?? ""}`)
      .join("\n\n")
      .slice(0, 24000);

    const specs = body.platforms.map((id) => platformById(id)!).filter(Boolean);

    const instructions = specs
      .map((s) => `- "${s.id}" (${s.label}): ${s.brief}${s.limit ? ` Max ${s.limit} characters.` : ""}`)
      .join("\n");

    const raw = await chatText(
      [
        { role: "system", content: `${SYSTEM}\n\nBRAND PROFILE\n${brandBlock(brand as BrandProfile | null)}` },
        {
          role: "user",
          content:
            `Write one draft per platform from the note(s) below.\n\nPLATFORMS\n${instructions}\n\n` +
            (body.notes?.trim() ? `Extra direction: ${body.notes.trim()}\n\n` : "") +
            `NOTE(S)\n${source}\n\n` +
            'Reply with JSON only: {"drafts":[{"platform":"<id>","content":"<draft text>"}]} — one entry per ' +
            "platform listed, in that order. Put real newlines inside the content strings as \\n.",
        },
      ],
      { reasoning_effort: "medium" },
    );

    const parsedOut = parseJson<{ drafts?: { platform?: string; content?: string }[] }>(raw);
    const drafts = (parsedOut?.drafts ?? []).filter(
      (d) => typeof d?.platform === "string" && typeof d?.content === "string" && d.content.trim(),
    );
    if (!drafts.length) throw new HttpError(502, "The AI didn't return usable drafts — try again.");

    const rows = drafts
      .map((d) => {
        const spec = platformById(d.platform!);
        if (!spec) return null;
        const content = clamp(d.content!, spec.limit);
        return {
          user_id: userId,
          dump_id: body.dumpIds[0],
          project_id: null as string | null,
          platform: spec.id,
          variant: spec.variant,
          title: dumps[0].title,
          content,
          char_count: content.length,
          status: "draft",
          prompt_notes: body.notes ?? null,
        };
      })
      .filter(Boolean) as Record<string, unknown>[];

    const { data: inserted, error } = await supabase.from("posts").insert(rows).select("id, platform, content");
    if (error) throw new HttpError(500, "Could not save the drafts.");

    await supabase.from("dumps").update({ status: "used" }).in("id", body.dumpIds).eq("user_id", userId);

    return new Response(JSON.stringify({ ok: true, posts: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
