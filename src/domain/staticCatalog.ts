import type {Recipe} from './types';
import {normalizeFa} from './normalize';

/**
 * The bundled recipe catalog is immutable application content, not mutable
 * user data. Reading it from the JS bundle avoids a large SQLite import
 * transaction on every new Android installation or catalog revision.
 *
 * Return copies of result arrays; never sort/mutate the source catalog.
 */
export function pageStaticCatalog(
  catalog: readonly Recipe[],
  limit = 24,
  offset = 0,
  category?: string,
): Recipe[] {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
      !Number.isSafeInteger(offset) || offset < 0) {
    throw new Error('بازه جست‌وجو نامعتبر است');
  }
  const filtered = category
    ? catalog.filter(item => item.categories.some(value => value === category))
    : catalog;
  return [...filtered]
    .sort((a, b) => a.title.localeCompare(b.title, 'fa') || a.id.localeCompare(b.id))
    .slice(offset, offset + limit);
}

export function searchStaticCatalog(
  catalog: readonly Recipe[],
  query: string,
  limit = 24,
): Recipe[] {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('محدودیت جست‌وجو نامعتبر است');
  }
  const needle = normalizeFa(query);
  if (!needle) return pageStaticCatalog(catalog, limit, 0);
  return catalog
    .filter(item => normalizeFa(item.title).includes(needle))
    .sort((a, b) => a.title.localeCompare(b.title, 'fa') || a.id.localeCompare(b.id))
    .slice(0, limit);
}
