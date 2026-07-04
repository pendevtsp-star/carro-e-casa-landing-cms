import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeWhatsappNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function buildWhatsappUrl(number: string, message?: string) {
  const cleanNumber = normalizeWhatsappNumber(
    number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "558230287161",
  );
  const encodedMessage = encodeURIComponent(
    message || "Olá, vim pelo site da Carro & Casa e gostaria de atendimento.",
  );

  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text.length ? text : null;
}

export function formString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export function formBool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function parseOrder(formData: FormData, fallback = 0) {
  const value = Number(formData.get("order"));
  return Number.isFinite(value) ? value : fallback;
}
