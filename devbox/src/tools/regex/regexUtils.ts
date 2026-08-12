/**
 * Regex testing utility functions
 */

export interface RegexMatch {
  match: string;
  index: number;
  groups: Record<string, string> | null;
}

export interface RegexResult {
  matches: RegexMatch[];
  matchCount: number;
  isValid: boolean;
  error: string | null;
}

export function testRegex(pattern: string, testString: string, flags: string): RegexResult {
  if (!pattern) {
    return { matches: [], matchCount: 0, isValid: true, error: null };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err) {
    return {
      matches: [],
      matchCount: 0,
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid regex',
    };
  }

  const matches: RegexMatch[] = [];

  if (flags.includes('g')) {
    let m: RegExpExecArray | null;
    let safetyCount = 0;
    while ((m = regex.exec(testString)) !== null && safetyCount < 500) {
      matches.push({
        match: m[0],
        index: m.index,
        groups: m.groups ? { ...m.groups } : null,
      });
      // Avoid infinite loop on zero-length matches
      if (m[0].length === 0) regex.lastIndex++;
      safetyCount++;
    }
  } else {
    const m = regex.exec(testString);
    if (m) {
      matches.push({
        match: m[0],
        index: m.index,
        groups: m.groups ? { ...m.groups } : null,
      });
    }
  }

  return {
    matches,
    matchCount: matches.length,
    isValid: true,
    error: null,
  };
}

export function highlightMatches(testString: string, pattern: string, flags: string): { text: string; isMatch: boolean }[] {
  if (!pattern || !testString) return [{ text: testString, isMatch: false }];

  let regex: RegExp;
  try {
    // Always use global for highlighting
    const globalFlags = flags.includes('g') ? flags : flags + 'g';
    regex = new RegExp(pattern, globalFlags);
  } catch {
    return [{ text: testString, isMatch: false }];
  }

  const segments: { text: string; isMatch: boolean }[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let safetyCount = 0;

  while ((m = regex.exec(testString)) !== null && safetyCount < 500) {
    if (m.index > lastIndex) {
      segments.push({ text: testString.slice(lastIndex, m.index), isMatch: false });
    }
    segments.push({ text: m[0], isMatch: true });
    lastIndex = m.index + m[0].length;
    if (m[0].length === 0) {
      regex.lastIndex++;
    }
    safetyCount++;
  }

  if (lastIndex < testString.length) {
    segments.push({ text: testString.slice(lastIndex), isMatch: false });
  }

  return segments.length > 0 ? segments : [{ text: testString, isMatch: false }];
}

export const COMMON_PATTERNS: { name: string; pattern: string; flags: string }[] = [
  { name: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: '' },
  { name: 'URL', pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/\\w\\-.?=%&]*', flags: 'g' },
  { name: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { name: 'Phone', pattern: '\\+?[1-9]\\d{1,14}', flags: 'g' },
  { name: 'Hex Color', pattern: '#[0-9a-fA-F]{3,8}\\b', flags: 'g' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
];
