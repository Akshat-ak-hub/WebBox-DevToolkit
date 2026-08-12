/**
 * URL encoding/decoding utility functions
 */

export function encodeUrlComponent(input: string): string {
  return encodeURIComponent(input);
}

export function decodeUrlComponent(input: string): string {
  return decodeURIComponent(input);
}

export function encodeFullUrl(input: string): string {
  return encodeURI(input);
}

export function decodeFullUrl(input: string): string {
  return decodeURI(input);
}

export function isUrlEncoded(input: string): boolean {
  return /%[0-9A-Fa-f]{2}/.test(input);
}

export function getUrlParts(input: string): Record<string, string> | null {
  try {
    const url = new URL(input);
    const parts: Record<string, string> = {};
    if (url.protocol) parts['Protocol'] = url.protocol;
    if (url.hostname) parts['Host'] = url.hostname;
    if (url.port) parts['Port'] = url.port;
    if (url.pathname && url.pathname !== '/') parts['Path'] = url.pathname;
    if (url.search) parts['Query'] = url.search;
    if (url.hash) parts['Hash'] = url.hash;
    return parts;
  } catch {
    return null;
  }
}
