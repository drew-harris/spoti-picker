import { ResultAsync } from "neverthrow";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry<unknown>>();

const isExpired = (entry: CacheEntry<unknown>): boolean => {
  return Date.now() > entry.expiresAt;
};

export const cached = async <T>(
  fn: () => Promise<T>,
  key: string | string[],
  ttlMs: number = 5 * 60 * 1000, // Default 5 minutes
): Promise<T> => {
  const cacheKey = Array.isArray(key) ? key.join(":") : key;

  const existing = _cache.get(cacheKey);
  if (existing && !isExpired(existing)) {
    return Promise.resolve(existing.value as T);
  }

  return fn().then((result) => {
    _cache.set(cacheKey, {
      value: result,
      expiresAt: Date.now() + ttlMs,
    });
    return result;
  });
};

export const cachedResult = <T, E>(
  fn: () => ResultAsync<T, E>,
  key: string | string[],
  ttlMs: number = 5 * 60 * 1000, // Default 5 minutes
): ResultAsync<T, E> => {
  const cacheKey = Array.isArray(key) ? key.join(":") : key;

  const existing = _cache.get(cacheKey);
  if (existing && !isExpired(existing)) {
    return ResultAsync.fromPromise(
      Promise.resolve(existing.value as T),
      () => new Error("Cache retrieval failed") as E,
    );
  }

  return fn().andTee((result) => {
    _cache.set(cacheKey, {
      value: result,
      expiresAt: Date.now() + ttlMs,
    });
    return result;
  });
};
