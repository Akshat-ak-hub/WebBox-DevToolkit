/**
 * JSON utility functions — format, minify, validate, sort, syntax highlight
 */

export interface JsonValidationResult {
  valid: boolean;
  error?: {
    message: string;
    line: number;
    column: number;
  };
}

export function formatJson(input: string, indent: number | string = 2): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent === 'tab' ? '\t' : Number(indent));
}

export function minifyJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

export function sortJsonKeys(input: string, order: 'asc' | 'desc' = 'asc', indent: number | string = 2): string {
  const parsed = JSON.parse(input);

  function sortObject(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);

    const keys = Object.keys(obj as Record<string, unknown>);
    keys.sort((a, b) => (order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));

    const sorted: Record<string, unknown> = {};
    for (const key of keys) {
      sorted[key] = sortObject((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }

  const sortedObj = sortObject(parsed);
  return JSON.stringify(sortedObj, null, indent === 'tab' ? '\t' : Number(indent));
}

export function validateJson(input: string): JsonValidationResult {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    let line = 1;
    let column = 1;

    const posMatch = message.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const upToPos = input.substring(0, pos);
      const lines = upToPos.split('\n');
      line = lines.length;
      column = (lines[lines.length - 1]?.length || 0) + 1;
    }

    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    }

    let cleanMessage = message
      .replace(/^JSON\.parse:\s*/i, '')
      .replace(/^Unexpected/i, 'Unexpected')
      .replace(/\s+at position \d+.*$/i, '')
      .replace(/\s+at line \d+ column \d+.*$/i, '');

    return {
      valid: false,
      error: {
        message: cleanMessage,
        line,
        column,
      },
    };
  }
}

export function getJsonStats(input: string): { keys: number; depth: number; size: string; arrayItems: number } {
  try {
    const parsed = JSON.parse(input);
    let keyCount = 0;
    let maxDepth = 0;
    let arrayCount = 0;

    function traverse(obj: unknown, depth: number) {
      if (depth > maxDepth) maxDepth = depth;
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          arrayCount += obj.length;
          obj.forEach((item) => traverse(item, depth + 1));
        } else {
          const keys = Object.keys(obj as Record<string, unknown>);
          keyCount += keys.length;
          keys.forEach((key) => traverse((obj as Record<string, unknown>)[key], depth + 1));
        }
      }
    }

    traverse(parsed, 0);
    const bytes = new TextEncoder().encode(input).length;
    const size = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

    return { keys: keyCount, depth: maxDepth, size, arrayItems: arrayCount };
  } catch {
    return { keys: 0, depth: 0, size: '0 B', arrayItems: 0 };
  }
}

export interface FlatJsonProperty {
  path: string;
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
}

export function flattenJson(jsonString: string): FlatJsonProperty[] {
  try {
    const parsed = JSON.parse(jsonString);
    const result: FlatJsonProperty[] = [];

    function recurse(curr: unknown, path: string, keyName: string) {
      if (curr === null) {
        result.push({ path: path || keyName, key: keyName, value: null, type: 'null' });
      } else if (Array.isArray(curr)) {
        result.push({ path: path || keyName, key: keyName, value: `[Array(${curr.length})]`, type: 'array' });
        curr.forEach((item, idx) => {
          const subPath = path ? `${path}[${idx}]` : `[${idx}]`;
          recurse(item, subPath, `[${idx}]`);
        });
      } else if (typeof curr === 'object') {
        if (path) {
          result.push({ path, key: keyName, value: '{Object}', type: 'object' });
        }
        for (const [k, v] of Object.entries(curr as Record<string, unknown>)) {
          const subPath = path ? `${path}.${k}` : k;
          recurse(v, subPath, k);
        }
      } else {
        const valType = typeof curr as 'string' | 'number' | 'boolean';
        result.push({ path: path || keyName, key: keyName, value: curr, type: valType });
      }
    }

    recurse(parsed, '', '$');
    return result;
  } catch {
    return [];
  }
}

export function syntaxHighlightJson(json: string): string {
  if (!json) return '';
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
