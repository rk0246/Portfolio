/**
 * In-memory TTL cache for upstream API calls — the stand-in for Next's fetch
 * data cache, which keyed each request with its own revalidate.
 *
 * shortcut: per server instance only, so a cold serverless instance starts
 * empty and pays the full request cost; move to Vercel KV / Redis if the
 * Unsplash rate limit starts biting.
 *
 * Only successful results are kept: a rejected promise is evicted, so one
 * failure is not served for the whole TTL.
 */
const store = new Map();

export function cached(key, ttlSeconds, fn) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = fn();
  store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  value.catch(() => store.delete(key));
  return value;
}
