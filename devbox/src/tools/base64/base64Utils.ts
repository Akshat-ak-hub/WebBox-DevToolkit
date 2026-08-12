/**
 * Base64 utility functions — encode, decode with full Unicode support
 */

export function encodeBase64(input: string): string {
  // Handle Unicode by encoding to UTF-8 bytes first
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function decodeBase64(input: string): string {
  // Decode Base64 then interpret as UTF-8
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

export function isValidBase64(input: string): boolean {
  if (!input || input.trim().length === 0) return false;
  // Standard Base64 regex
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const trimmed = input.trim();
  if (!base64Regex.test(trimmed)) return false;
  try {
    atob(trimmed);
    return true;
  } catch {
    return false;
  }
}
