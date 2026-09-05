import "server-only";

import { headers } from "next/headers";

type Counter = { count: number; resetAt: number };

const store = new Map<string, Counter>();

export type RateLimitResult = { ok: boolean; retryAfterSeconds?: number };

function entry(key: string, windowMs: number, now: number): Counter {
  let c = store.get(key);
  if (!c || c.resetAt <= now) {
    c = { count: 0, resetAt: now + windowMs };
    store.set(key, c);
  }
  return c;
}

function cleanup(now: number) {
  for (const [key, c] of store) {
    if (c.resetAt <= now) store.delete(key);
  }
}

function result(c: Counter, max: number, now: number): RateLimitResult {
  if (c.count >= max) return { ok: false, retryAfterSeconds: Math.ceil((c.resetAt - now) / 1000) };
  return { ok: true };
}

/** Check + record an attempt (used for a global per-IP cap). */
export async function rateLimit(
  identifier: string,
  opts: { max: number; windowMs: number },
): Promise<RateLimitResult> {
  const now = Date.now();
  cleanup(now);
  const c = entry(identifier, opts.windowMs, now);
  c.count += 1;
  return result(c, opts.max, now);
}

/** Check only, without recording (used to test if a key is already locked). */
export async function isLocked(
  identifier: string,
  opts: { max: number; windowMs: number },
): Promise<RateLimitResult> {
  const now = Date.now();
  cleanup(now);
  const c = store.get(identifier);
  if (!c || c.resetAt <= now) return { ok: true };
  return result(c, opts.max, now);
}

/** Record a failure (used for per-email lockout that only counts real failures). */
export async function recordFailure(identifier: string, windowMs: number) {
  const now = Date.now();
  cleanup(now);
  const c = entry(identifier, windowMs, now);
  c.count += 1;
}

export async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    const trusted = process.env.TRUSTED_PROXY !== "0";
    const xff = h.get("x-forwarded-for");
    if (xff && trusted) {
      const first = xff.split(",")[0].trim();
      if (/^[\d.:a-fA-F]+$/.test(first) && first.length <= 45) return first;
    }
    const realIp = h.get("x-real-ip");
    if (realIp && /^[\d.:a-fA-F]+$/.test(realIp)) return realIp;
    return "local";
  } catch {
    return "local";
  }
}
