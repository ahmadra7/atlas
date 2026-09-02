import { normalizePersian } from "@atlas/shared";

/** Stable id so recipe lines and the ingredient catalog stay in sync. */
export function ingredientIdFromName(name: string): string {
  const n = normalizePersian(name);
  let hash = 5381;
  for (let i = 0; i < n.length; i += 1) {
    hash = (hash * 33) ^ n.charCodeAt(i);
  }
  return `ing-${(hash >>> 0).toString(16)}`;
}
