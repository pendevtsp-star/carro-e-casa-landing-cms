import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const AUTH_TAG_LENGTH = 16;

function getKey() {
  const source = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!source) {
    throw new Error("Configure AUTH_SECRET ou GOOGLE_TOKEN_ENCRYPTION_KEY.");
  }

  return createHash("sha256").update(source).digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(value: string) {
  const [ivText, tagText, encryptedText] = value.split(".");
  const tag = tagText ? Buffer.from(tagText, "base64url") : null;

  if (!ivText || !tag || tag.length !== AUTH_TAG_LENGTH || !encryptedText) {
    throw new Error("Token criptografado inválido.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivText, "base64url"), {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
