import { randomUUID } from "crypto";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const MEDIA_BUCKET = "portfolio-media";

export const REVIEW_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ADMIN_MEDIA_TYPES = new Set([...REVIEW_IMAGE_TYPES]);

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName) return fromName.slice(0, 8);
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  return byMime[file.type] || "bin";
}

export async function uploadPublicMedia(file: File, folder: string) {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Supabase not configured");

  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "-").replace(/^\/+|\/+$/g, "");
  const path = `${safeFolder}/${Date.now()}-${randomUUID()}.${extensionFor(file)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
    cacheControl: "3600",
  });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function deletePublicMedia(path: string | null | undefined) {
  if (!path) return;
  const supabase = getAdminClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) console.error(error);
}
