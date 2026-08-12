/**
 * UUID generation utility functions
 * Uses crypto.randomUUID() for cryptographically secure UUIDs (v4).
 */

export function generateUuid(): string {
  return crypto.randomUUID();
}

export function generateMultipleUuids(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

export function isValidUuid(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    input.trim()
  );
}

export type UuidCase = 'lower' | 'upper';

export function formatUuid(uuid: string, uuidCase: UuidCase = 'lower'): string {
  return uuidCase === 'upper' ? uuid.toUpperCase() : uuid.toLowerCase();
}
