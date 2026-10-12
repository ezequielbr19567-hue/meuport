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
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return byMime[file.type] || "bin";
}

export async function validateImageFile(file: File) {
  if (!REVIEW_IMAGE_TYPES.has(file.type) || file.size === 0 || file.size > 3 * 1024 * 1024) {
    return "Use uma imagem JPG, PNG, WEBP ou GIF de até 3 MB.";
  }
  // MIME and extension are supplied by the browser and can be forged. Verify
  // file signatures as well; this is validation, not malware scanning/re-encoding.
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  let detected = "";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) detected = "image/jpeg";
  else if (bytes.length >= 24 && [137,80,78,71,13,10,26,10].every((value, i) => bytes[i] === value) && ascii(12, 16) === "IHDR") detected = "image/png";
  else if (bytes.length >= 13 && ["GIF87a", "GIF89a"].includes(ascii(0, 6))) detected = "image/gif";
  else if (bytes.length >= 16 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP" && ["VP8 ", "VP8L", "VP8X"].includes(ascii(12, 16))) detected = "image/webp";
  return detected === file.type ? null : "O conteúdo do arquivo não corresponde a uma imagem permitida.";
}

export async function uploadPublicMedia(file: File, folder: string) {
  const invalid = await validateImageFile(file);
  if (invalid) throw new Error(invalid);
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
  // Storage object names, not URLs or traversal paths.
  if (path.length > 300 || !/^[a-z0-9/_-]+\.[a-z0-9]+$/i.test(path)) return;
  const supabase = getAdminClient();
  if (!supabase) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) console.error(error);
}
