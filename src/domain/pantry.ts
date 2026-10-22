import type {PantryItem} from './types';
import {isExpired,localIsoDay} from './dates';
/** Missing/invalid expiry dates are not automatically judged expired. */
export function usablePantry(pantry: readonly PantryItem[], day: string=localIsoDay()): PantryItem[] {
  return pantry.filter(item => !isExpired(item.expiresOn, day));
}
/** A missing quantity is never treated as a sufficient quantity. */
export function isPotentiallyAvailable(item: PantryItem, day: string=localIsoDay()): boolean {
  return !isExpired(item.expiresOn, day);
}
