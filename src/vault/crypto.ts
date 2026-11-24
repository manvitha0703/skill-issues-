import { EncryptedVaultPayload } from '../types/vault';

/**
 * Web Crypto API AES-GCM 256-bit encryption with PBKDF2 key derivation.
 * Works natively in modern browsers, extensions, and worker threads.
 */

// Helper to convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class VaultCrypto {
  private static readonly SALT_LENGTH = 16;
  private static readonly IV_LENGTH = 12; // Standard recommended IV length for AES-GCM
  private static readonly ITERATIONS = 100000;

  /**
   * Derives an AES-GCM 256-bit key from a user PIN/passphrase and salt using PBKDF2
   */
  private static async deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const pinBuffer = encoder.encode(pin);

    // Import the raw PIN as PBKDF2 key material
    const baseKey = await crypto.subtle.importKey(
      'raw',
      pinBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive the 256-bit AES-GCM key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plaintext JSON data with a PIN
   */
  static async encrypt(data: unknown, pin: string): Promise<EncryptedVaultPayload> {
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const key = await this.deriveKey(pin, salt);

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    return {
      version: 1,
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(ciphertext),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Decrypts an EncryptedVaultPayload using the user PIN.
   * Throws an error if the PIN is incorrect or payload is tampered with.
   */
  static async decrypt<T>(payload: EncryptedVaultPayload, pin: string): Promise<T> {
    const salt = base64ToBuffer(payload.salt);
    const iv = base64ToBuffer(payload.iv);
    const ciphertext = base64ToBuffer(payload.ciphertext);

    const key = await this.deriveKey(pin, salt);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource,
        },
        key,
        ciphertext as BufferSource
      );

      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(decryptedBuffer);
      return JSON.parse(jsonStr) as T;
    } catch (err) {
      throw new Error('Invalid vault PIN or corrupted vault data.');
    }
  }

  /**
   * Generates a verification hash to quickly check if a PIN matches without decrypting full data
   */
  static async hashPin(pin: string, saltStr?: string): Promise<{ hash: string; salt: string }> {
    const salt = saltStr ? base64ToBuffer(saltStr) : crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const pinBytes = encoder.encode(pin);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      pinBytes,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 50000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    return {
      hash: bufferToBase64(hashBuffer),
      salt: bufferToBase64(salt),
    };
  }
}
