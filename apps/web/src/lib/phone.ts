export function normalizeIranMobile(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  let n = digits;
  if (n.startsWith("0098")) n = n.slice(4);
  else if (n.startsWith("98")) n = n.slice(2);
  if (n.startsWith("0")) n = n.slice(1);
  if (n.length !== 10 || !n.startsWith("9")) return null;
  return `0${n}`;
}

export function formatIranMobile(phone: string): string {
  const n = normalizeIranMobile(phone) ?? phone.replace(/[^\d]/g, "");
  if (n.length !== 11) return phone;
  return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`;
}

export function greetingFirstName(displayName?: string | null): string | null {
  const name = displayName?.trim();
  if (!name) return null;
  return name.split(/\s+/)[0] ?? null;
}
