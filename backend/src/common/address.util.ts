/**
 * Normalizes a custom mini-browser address so lookups and storage are consistent.
 * Examples:
 *  - "  TidePool.zz/ " -> "tidepool.zz"
 *  - "http://observatory.zz" -> "observatory.zz"
 */
export function normalizeAddress(rawAddress: string): string {
  return rawAddress
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/\/+$/, '');
}
