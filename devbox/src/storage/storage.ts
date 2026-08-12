/**
 * Storage utility — thin wrapper around chrome.storage.local
 * Falls back to localStorage when running outside Chrome extension context (dev mode).
 */

const isChromeExtension =
  typeof chrome !== 'undefined' &&
  typeof chrome.storage !== 'undefined' &&
  typeof chrome.storage.local !== 'undefined';

export async function getStorage<T>(key: string, defaultValue: T): Promise<T> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  }
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setStorage<T>(key: string, value: T): Promise<void> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export async function removeStorage(key: string): Promise<void> {
  if (isChromeExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    });
  }
  localStorage.removeItem(key);
}
