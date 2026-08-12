import { getStorage, setStorage } from '../../storage/storage';

export interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
  pinned?: boolean;
  type?: 'json' | 'jwt' | 'base64' | 'url' | 'text' | 'color' | 'uuid';
}

const STORAGE_KEY = 'devbox_clipboard_history';
const MAX_HISTORY = 100;

export async function getClipboardHistory(): Promise<ClipboardItem[]> {
  const items = await getStorage<ClipboardItem[]>(STORAGE_KEY, []);
  return items;
}

export async function saveClipboardHistory(items: ClipboardItem[]): Promise<void> {
  await setStorage(STORAGE_KEY, items);
}

export async function addClipboardItem(content: string, type?: ClipboardItem['type']): Promise<ClipboardItem[]> {
  if (!content || !content.trim()) return await getClipboardHistory();

  const current = await getClipboardHistory();
  const trimmed = content.trim();

  // If item already exists, bump it to top (unless pinned, keep pinned status)
  const existingIndex = current.findIndex((i) => i.content === trimmed);
  let isPinned = false;
  if (existingIndex !== -1) {
    isPinned = !!current[existingIndex].pinned;
    current.splice(existingIndex, 1);
  }

  const newItem: ClipboardItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    content: trimmed,
    timestamp: Date.now(),
    pinned: isPinned,
    type: type || detectContentType(trimmed),
  };

  // Pinned items stay at top or prioritized
  const updated = [newItem, ...current];

  // Limit unpinned items to MAX_HISTORY
  const pinned = updated.filter((i) => i.pinned);
  const unpinned = updated.filter((i) => !i.pinned).slice(0, MAX_HISTORY);

  const finalItems = [...pinned, ...unpinned];
  await saveClipboardHistory(finalItems);
  return finalItems;
}

export async function togglePinClipboardItem(id: string): Promise<ClipboardItem[]> {
  const current = await getClipboardHistory();
  const updated = current.map((item) =>
    item.id === id ? { ...item, pinned: !item.pinned } : item
  );
  await saveClipboardHistory(updated);
  return updated;
}

export async function deleteClipboardItem(id: string): Promise<ClipboardItem[]> {
  const current = await getClipboardHistory();
  const updated = current.filter((item) => item.id !== id);
  await saveClipboardHistory(updated);
  return updated;
}

export async function clearClipboardHistory(): Promise<ClipboardItem[]> {
  const current = await getClipboardHistory();
  // Keep pinned items when clearing if preferred, or clear only unpinned
  const keptPinned = current.filter((item) => item.pinned);
  await saveClipboardHistory(keptPinned);
  return keptPinned;
}

export async function clearAllClipboardHistory(): Promise<ClipboardItem[]> {
  await saveClipboardHistory([]);
  return [];
}

export function detectContentType(content: string): ClipboardItem['type'] {
  if (/^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(content)) return 'jwt';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(content)) return 'uuid';
  if (/^#[0-9a-fA-F]{3,8}$/.test(content)) return 'color';
  if (/^https?:\/\//i.test(content)) return 'url';
  if (content.startsWith('{') || content.startsWith('[')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // not valid json
    }
  }
  return 'text';
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
