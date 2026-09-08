import { z } from "zod";

export const MAX_POST_CONTENT = 5000;

export const displayNameSchema = z
  .string()
  .trim()
  .max(80, "Display name must be 80 characters or less");

export const handleSchema = z
  .string()
  .trim()
  .min(1, "Enter a handle")
  .max(50, "Handle must be 50 characters or less")
  .regex(/^@?[A-Za-z0-9._-]+$/, "Handles can only contain letters, numbers, dots, dashes and underscores");

export const projectTitleSchema = z
  .string()
  .trim()
  .min(1, "Enter a title")
  .max(120, "Title must be 120 characters or less");

export const postContentSchema = z
  .string()
  .trim()
  .max(MAX_POST_CONTENT, `Content must be ${MAX_POST_CONTENT} characters or less`);

export const externalUrlSchema = z
  .string()
  .trim()
  .max(2048, "Link is too long")
  .url("Enter a valid URL")
  .refine((v) => /^https?:\/\//i.test(v), "Links must start with http:// or https://");

/** Returns the URL only when it is a safe http(s) link, otherwise null. */
export function safeExternalUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** First zod error message, or null when valid. */
export function firstError(result: z.SafeParseReturnType<unknown, unknown>): string | null {
  return result.success ? null : result.error.issues[0]?.message ?? "Invalid input";
}
