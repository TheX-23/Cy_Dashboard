type Bucket = { count: number; resetAt: number };

const inMemoryStore = new Map<string, Bucket>();

export function applyRateLimit(key: string, windowMs = 60_000, max = 120): boolean {
  const now = Date.now();
  const bucket = inMemoryStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) {
    return false;
  }

  bucket.count += 1;
  inMemoryStore.set(key, bucket);
  return true;
}
