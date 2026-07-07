const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

type AttemptEntry = {
  count: number;
  firstAttemptAt: number;
  blockedUntil: number | null;
};

const globalStore = globalThis as typeof globalThis & {
  __carroCasaLoginRateLimit?: Map<string, AttemptEntry>;
};

const attempts = globalStore.__carroCasaLoginRateLimit ?? new Map<string, AttemptEntry>();
globalStore.__carroCasaLoginRateLimit = attempts;

function now() {
  return Date.now();
}

function normalizeKeyPart(value: string) {
  return value.trim().toLowerCase() || "unknown";
}

function getEntry(key: string) {
  const entry = attempts.get(key);
  if (!entry) return null;

  const currentTime = now();
  if (entry.blockedUntil && entry.blockedUntil > currentTime) {
    return entry;
  }

  if (currentTime - entry.firstAttemptAt > WINDOW_MS) {
    attempts.delete(key);
    return null;
  }

  if (entry.blockedUntil && entry.blockedUntil <= currentTime) {
    attempts.delete(key);
    return null;
  }

  return entry;
}

export function buildLoginRateLimitKey(ip: string, email: string) {
  return `${normalizeKeyPart(ip)}:${normalizeKeyPart(email)}`;
}

export function isLoginBlocked(key: string) {
  const entry = getEntry(key);
  return Boolean(entry?.blockedUntil && entry.blockedUntil > now());
}

export function recordLoginFailure(key: string) {
  const currentTime = now();
  const entry = getEntry(key);

  if (!entry) {
    attempts.set(key, {
      count: 1,
      firstAttemptAt: currentTime,
      blockedUntil: null,
    });
    return;
  }

  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = currentTime + LOCK_MS;
  }

  attempts.set(key, entry);
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}

export function getClientIp(source: Headers | Request["headers"]) {
  const forwardedFor = source.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = source.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}
