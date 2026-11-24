/**
 * Safe abstraction over chrome.storage.local with automatic fallback
 * to localStorage in standard web browser contexts or unit tests.
 */

export class SafeStorage {
  private static isChromeStorageAvailable(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      !!chrome.storage &&
      !!chrome.storage.local
    );
  }

  static async get<T>(key: string, defaultValue: T): Promise<T> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            console.warn(`SafeStorage get error for key "${key}":`, chrome.runtime.lastError);
            resolve(defaultValue);
          } else {
            resolve(result[key] !== undefined ? (result[key] as T) : defaultValue);
          }
        });
      });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = window.localStorage.getItem(key);
        if (item === null) return defaultValue;
        return JSON.parse(item) as T;
      } catch (err) {
        console.warn(`LocalStorage read error for key "${key}":`, err);
        return defaultValue;
      }
    }
    return defaultValue;
  }

  static async set<T>(key: string, value: T): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn(`LocalStorage write error for key "${key}":`, err);
      }
    }
  }

  static async remove(key: string): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => {
          resolve();
        });
      });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }

  static async clear(): Promise<void> {
    if (this.isChromeStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => {
          resolve();
        });
      });
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  }
}
