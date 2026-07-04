import path from "node:path";

export function getUploadRoot() {
  const configured = process.env.UPLOAD_DIR;

  if (configured) {
    return path.resolve(/* turbopackIgnore: true */ configured);
  }

  return path.join(process.cwd(), "uploads");
}

export function resolveUploadedFile(fileName: string) {
  const uploadRoot = getUploadRoot();
  const absolutePath = path.resolve(uploadRoot, fileName);

  if (!absolutePath.startsWith(uploadRoot)) {
    return null;
  }

  return { uploadRoot, absolutePath };
}
