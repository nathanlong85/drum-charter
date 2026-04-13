/**
 * Generates a unique ID using crypto.randomUUID() if available,
 * falling back to a timestamp + random string for non-secure contexts.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
