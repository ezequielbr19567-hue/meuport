import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { ADMIN_MEDIA_TYPES, uploadPublicMedia, validateImageFile } from "@/lib/storage";
import { readFormBody } from "@/lib/security";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const parsed = await readFormBody(request);
  if ("error" in parsed) return parsed.error;
  const form = parsed.data;
  const file = form?.get("file");
  const folderRaw = String(form?.get("folder") || "admin");
  const folder = folderRaw.replace(/[^a-z0-9/_-]/gi, "-").slice(0, 80) || "admin";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecione um arquivo." }, { status: 400 });
  }

  if (!ADMIN_MEDIA_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Formato não permitido. Use JPG, PNG, WEBP ou GIF." }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Imagens devem ter no máximo 3 MB." }, { status: 400 });
  }

  const invalidImage = await validateImageFile(file);
  if (invalidImage) return NextResponse.json({ error: invalidImage }, { status: 400 });

  try {
    const uploaded = await uploadPublicMedia(file, `admin/${folder}`);
    return NextResponse.json({ ok: true, ...uploaded, type: "image" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível enviar o arquivo." }, { status: 500 });
  }
}
