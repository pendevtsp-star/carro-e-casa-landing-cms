import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

import { NextRequest } from "next/server";
import { Readable } from "node:stream";

import { resolveUploadedFile } from "@/lib/uploads";

const mimeByExt: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  if (!/^[a-zA-Z0-9._-]+$/.test(file)) {
    return new Response("Arquivo inválido", { status: 400 });
  }

  const resolved = resolveUploadedFile(file);
  if (!resolved) {
    return new Response("Arquivo inválido", { status: 400 });
  }

  try {
    const info = await stat(resolved.absolutePath);
    const stream = Readable.toWeb(createReadStream(resolved.absolutePath));
    const contentType = mimeByExt[path.extname(file).toLowerCase()] || "application/octet-stream";

    return new Response(stream as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${file}"`,
      },
    });
  } catch {
    return new Response("Arquivo não encontrado", { status: 404 });
  }
}
