/**
 * Generates a unique ID using crypto.randomUUID() if available,
 * falling back to a timestamp + random string for non-secure contexts.
 */
export function generateId(): string {
  // Use globalThis.crypto which is available in Node.js 19+ and modern browsers
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback for older environments or non-secure contexts
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
