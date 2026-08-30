const loaded = new Set<string>();

export function rememberLoadedImage(src: string) {
  if (src) loaded.add(src);
}

export function imageAlreadyLoaded(src?: string | null): boolean {
  return Boolean(src && loaded.has(src));
}
