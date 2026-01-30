const STORAGE_KEY_PREFIX = 'banking_';
const ENCRYPTION_KEY = 'banking-sector-2026';

export class SecureStorage {
  private static encrypt(data: string): string {
    try {
      const encoded = btoa(
        data
          .split('')
          .map((char, i) =>
            String.fromCharCode(
              char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
            )
          )
          .join('')
      );
      return encoded;
    } catch (error) {
      console.error('Encryption error:', error);
      return '';
    }
  }

  private static decrypt(data: string): string {
    try {
      const decoded = atob(data);
      return decoded
        .split('')
        .map((char, i) =>
          String.fromCharCode(
            char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
          )
        )
        .join('');
    } catch (error) {
      console.error('Decryption error:', error);
      return '';
    }
  }

  private static generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  static setItem<T>(key: string, value: T): boolean {
    try {
      const jsonString = JSON.stringify(value);
      const hash = this.generateHash(jsonString);
      const encrypted = this.encrypt(jsonString);

      const storageData = {
        data: encrypted,
        hash: hash,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${key}`,
        JSON.stringify(storageData)
      );
      return true;
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      return false;
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
      if (!stored) return null;

      const storageData = JSON.parse(stored);
      const decrypted = this.decrypt(storageData.data);

      const currentHash = this.generateHash(decrypted);
      if (currentHash !== storageData.hash) {
        console.warn('Data integrity check failed');
        this.removeItem(key);
        return null;
      }

      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('SecureStorage clear error:', error);
    }
  }

  static hasItem(key: string): boolean {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`) !== null;
  }
}
