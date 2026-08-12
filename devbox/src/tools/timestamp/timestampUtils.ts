/**
 * Timestamp conversion utility functions
 */

export interface DateInfo {
  utc: string;
  local: string;
  iso: string;
  relative: string;
  dayOfWeek: string;
  isMilliseconds: boolean;
}

export function isMilliseconds(timestamp: number): boolean {
  // Timestamps after year 2100 in seconds would be > 4102444800
  // Timestamps in milliseconds are typically 13 digits
  return timestamp > 9999999999;
}

export function unixToDate(timestamp: number): DateInfo {
  const isMs = isMilliseconds(timestamp);
  const ms = isMs ? timestamp : timestamp * 1000;
  const date = new Date(ms);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid timestamp');
  }

  return {
    utc: date.toUTCString(),
    local: date.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }),
    iso: date.toISOString(),
    relative: getRelativeTime(date),
    dayOfWeek: date.toLocaleDateString(undefined, { weekday: 'long' }),
    isMilliseconds: isMs,
  };
}

export function dateToUnix(date: Date): { seconds: number; milliseconds: number } {
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
  };
}

export function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs < 0;
  const suffix = isFuture ? 'from now' : 'ago';

  if (absDiff < 60000) return 'just now';
  if (absDiff < 3600000) {
    const mins = Math.floor(absDiff / 60000);
    return `${mins} minute${mins > 1 ? 's' : ''} ${suffix}`;
  }
  if (absDiff < 86400000) {
    const hours = Math.floor(absDiff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ${suffix}`;
  }
  if (absDiff < 2592000000) {
    const days = Math.floor(absDiff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ${suffix}`;
  }
  if (absDiff < 31536000000) {
    const months = Math.floor(absDiff / 2592000000);
    return `${months} month${months > 1 ? 's' : ''} ${suffix}`;
  }
  const years = Math.floor(absDiff / 31536000000);
  return `${years} year${years > 1 ? 's' : ''} ${suffix}`;
}

export function getCurrentTimestamp(): { seconds: number; milliseconds: number } {
  const now = Date.now();
  return {
    seconds: Math.floor(now / 1000),
    milliseconds: now,
  };
}
