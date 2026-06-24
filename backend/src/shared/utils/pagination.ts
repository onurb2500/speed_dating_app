/** Helpers for cursor-based pagination over createdAt-ordered lists. */

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Given a list fetched with `limit + 1` items, split off the extra element
 * to determine whether more pages exist and what the next cursor is.
 */
export function buildCursorPage<T extends { id: string }>(
  rows: T[],
  limit: number,
): CursorPage<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]!.id : null;
  return { items, nextCursor, hasMore };
}

/** Clamp a requested limit to [1, max]. */
export function clampLimit(
  requested: number | undefined,
  fallback: number,
  max: number,
): number {
  const n = requested ?? fallback;
  if (Number.isNaN(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), max);
}
