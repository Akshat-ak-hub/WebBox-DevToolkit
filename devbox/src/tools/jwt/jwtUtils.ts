/**
 * JWT utility functions — decode header and payload (no signature verification)
 */

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
}

export interface JwtInfo {
  parts: JwtParts;
  isExpired: boolean | null;
  expiresAt: Date | null;
  issuedAt: Date | null;
  notBefore: Date | null;
  issuer: string | null;
  subject: string | null;
  audience: string | string[] | null;
}

function base64UrlDecode(str: string): string {
  // Replace URL-safe chars and add padding
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  if (padding === 2) base64 += '==';
  else if (padding === 3) base64 += '=';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token: string): JwtInfo {
  const trimmed = token.trim();
  const segments = trimmed.split('.');

  if (segments.length !== 3) {
    throw new Error(`Invalid JWT: expected 3 segments, got ${segments.length}`);
  }

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;

  try {
    header = JSON.parse(base64UrlDecode(segments[0]));
  } catch {
    throw new Error('Invalid JWT: failed to decode header');
  }

  try {
    payload = JSON.parse(base64UrlDecode(segments[1]));
  } catch {
    throw new Error('Invalid JWT: failed to decode payload');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === 'number' ? payload.exp : null;
  const iat = typeof payload.iat === 'number' ? payload.iat : null;
  const nbf = typeof payload.nbf === 'number' ? payload.nbf : null;

  return {
    parts: {
      header,
      payload,
      signature: segments[2],
      headerRaw: segments[0],
      payloadRaw: segments[1],
    },
    isExpired: exp !== null ? now > exp : null,
    expiresAt: exp !== null ? new Date(exp * 1000) : null,
    issuedAt: iat !== null ? new Date(iat * 1000) : null,
    notBefore: nbf !== null ? new Date(nbf * 1000) : null,
    issuer: typeof payload.iss === 'string' ? payload.iss : null,
    subject: typeof payload.sub === 'string' ? payload.sub : null,
    audience: payload.aud as string | string[] | null ?? null,
  };
}

export function isJwt(input: string): boolean {
  return /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.trim());
}
