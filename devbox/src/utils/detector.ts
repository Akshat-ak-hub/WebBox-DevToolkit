/**
 * Universal Input Detector
 * Analyzes pasted text and detects its type with confidence scoring.
 */

export interface DetectedType {
  type: 'json' | 'jwt' | 'base64' | 'url-encoded' | 'uuid' | 'timestamp' | 'url' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  label: string;
  emoji: string;
  toolId: string;
  action: string;
}

export function detectInputType(input: string): DetectedType {
  const trimmed = input.trim();

  if (!trimmed) {
    return { type: 'unknown', confidence: 'low', label: 'Empty input', emoji: '❓', toolId: 'home', action: '' };
  }

  // JWT: Three dot-separated Base64url segments
  if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { type: 'jwt', confidence: 'high', label: 'Looks like a JWT token', emoji: '🔐', toolId: 'jwt', action: 'Decode JWT' };
  }

  // UUID: Standard UUID format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return { type: 'uuid', confidence: 'high', label: 'UUID detected', emoji: '🆔', toolId: 'uuid', action: 'View UUID' };
  }

  // JSON: Starts with { or [ and is valid
  if (/^[\[{]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return { type: 'json', confidence: 'high', label: 'Valid JSON detected', emoji: '📦', toolId: 'json', action: 'Format JSON' };
    } catch {
      // Might still be attempted JSON
      if (trimmed.length > 2) {
        return { type: 'json', confidence: 'medium', label: 'Looks like JSON (has errors)', emoji: '📦', toolId: 'json', action: 'Validate JSON' };
      }
    }
  }

  // URL-encoded: Contains percent-encoded characters
  if (/%[0-9A-Fa-f]{2}/.test(trimmed) && trimmed.includes('%')) {
    const percentCount = (trimmed.match(/%[0-9A-Fa-f]{2}/g) || []).length;
    if (percentCount >= 2) {
      return { type: 'url-encoded', confidence: 'high', label: 'URL-encoded text detected', emoji: '🔗', toolId: 'url', action: 'Decode URL' };
    }
    return { type: 'url-encoded', confidence: 'medium', label: 'Might be URL-encoded', emoji: '🔗', toolId: 'url', action: 'Decode URL' };
  }

  // Unix timestamp: All digits, reasonable range (seconds or milliseconds)
  if (/^\d{10,13}$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    const now = Date.now() / 1000;
    // Valid if within a reasonable range (year 2000 to year 2100)
    if (
      (trimmed.length === 10 && num >= 946684800 && num <= 4102444800) ||
      (trimmed.length === 13 && num >= 946684800000 && num <= 4102444800000)
    ) {
      return { type: 'timestamp', confidence: 'high', label: 'Unix timestamp detected', emoji: '🕐', toolId: 'timestamp', action: 'Convert Timestamp' };
    }
  }

  // Base64: Valid Base64 charset, reasonable length, divisible by 4 (with possible padding)
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length >= 4) {
    // Check it's not just a simple word
    if (trimmed.length >= 8 && trimmed.length % 4 <= 1) {
      try {
        atob(trimmed);
        return { type: 'base64', confidence: trimmed.includes('=') ? 'high' : 'medium', label: 'Looks like Base64', emoji: '🔢', toolId: 'base64', action: 'Decode Base64' };
      } catch {
        // Not valid Base64
      }
    }
  }

  // Color: HEX, RGB, or HSL
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
    return { type: 'color', confidence: 'high', label: 'HEX Color detected', emoji: '🎨', toolId: 'color', action: 'Inspect Color' };
  }
  if (/^rgb\s*\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(trimmed)) {
    return { type: 'color', confidence: 'high', label: 'RGB Color detected', emoji: '🎨', toolId: 'color', action: 'Inspect Color' };
  }
  if (/^hsl\s*\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)$/i.test(trimmed)) {
    return { type: 'color', confidence: 'high', label: 'HSL Color detected', emoji: '🎨', toolId: 'color', action: 'Inspect Color' };
  }

  // URL: Starts with http:// or https://
  if (/^https?:\/\//i.test(trimmed)) {
    return { type: 'url', confidence: 'high', label: 'URL detected', emoji: '🌐', toolId: 'url', action: 'Encode URL' };
  }

  return { type: 'unknown', confidence: 'low', label: 'Unrecognized format', emoji: '❓', toolId: 'home', action: '' };
}
