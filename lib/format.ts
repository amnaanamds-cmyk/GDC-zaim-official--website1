const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/**
 * Dates are formatted explicitly rather than with toLocaleDateString so the
 * server and the browser always produce the same string (no hydration
 * mismatch from a different server timezone or locale).
 */
export const fmtDate = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const fmtShort = (d: Date) => `${d.getUTCDate()} ${SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const dayOf = (d: Date) => String(d.getUTCDate()).padStart(2, '0');
export const monthOf = (d: Date) => SHORT[d.getUTCMonth()].toUpperCase();

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function fmtDuration(seconds?: number | null) {
  if (!seconds || !isFinite(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
