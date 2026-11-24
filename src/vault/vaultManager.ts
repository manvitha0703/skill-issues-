import { SafeStorage } from '../storage/chromeStorage';
import { VaultCrypto } from './crypto';
import {
  VaultData,
  EncryptedVaultPayload,
  VaultMetadata,
  CustomField,
} from '../types/vault';

const STORAGE_KEY_PAYLOAD = 'swde_vault_payload';
const STORAGE_KEY_META = 'swde_vault_metadata';
const STORAGE_KEY_PIN_VERIFY = 'swde_vault_pin_verify';

export const DEFAULT_EMPTY_VAULT: VaultData = {
  personal: {
    firstName: '',
    lastName: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
  },
  address: {
    addressLine: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
  },
  education: {
    school: '',
    college: '',
    university: '',
    course: '',
    degree: '',
    graduationYear: '',
    studentId: '',
    gpaCgpa: '',
  },
  professional: {
    jobTitle: '',
    skills: '',
    workExperience: '',
    organization: '',
    resumeDetails: '',
  },
  customFields: [],
};

export class VaultManager {
  private static cachedData: VaultData | null = null;
  private static cachedPin: string | null = null;
  private static lastActivityTimestamp: number = Date.now();

  /**
   * Check if user has initialized the vault with a PIN
   */
  static async isConfigured(): Promise<boolean> {
    const meta = await SafeStorage.get<VaultMetadata | null>(STORAGE_KEY_META, null);
    return !!meta?.isConfigured;
  }

  /**
   * Check if vault is currently locked
   */
  static async isLocked(): Promise<boolean> {
    const isConfig = await this.isConfigured();
    if (!isConfig) return false; // not configured, so not locked
    if (!this.cachedData || !this.cachedPin) return true;

    // Check inactivity
    const meta = await SafeStorage.get<VaultMetadata | null>(STORAGE_KEY_META, null);
    const timeoutMs = (meta?.inactivityLockMinutes || 15) * 60 * 1000;
    if (Date.now() - this.lastActivityTimestamp > timeoutMs) {
      this.lock();
      return true;
    }

    return false;
  }

  /**
   * Touch activity timer to prevent premature inactivity lock
   */
  static touch(): void {
    this.lastActivityTimestamp = Date.now();
  }

  /**
   * Initial vault setup: sets master PIN and initial data
   */
  static async setupVault(pin: string, initialData?: Partial<VaultData>): Promise<void> {
    if (!pin || pin.length < 4) {
      throw new Error('PIN must be at least 4 characters.');
    }

    const data: VaultData = {
      ...DEFAULT_EMPTY_VAULT,
      ...initialData,
      personal: { ...DEFAULT_EMPTY_VAULT.personal, ...(initialData?.personal || {}) },
      address: { ...DEFAULT_EMPTY_VAULT.address, ...(initialData?.address || {}) },
      education: { ...DEFAULT_EMPTY_VAULT.education, ...(initialData?.education || {}) },
      professional: { ...DEFAULT_EMPTY_VAULT.professional, ...(initialData?.professional || {}) },
      customFields: initialData?.customFields || [],
    };

    const encrypted = await VaultCrypto.encrypt(data, pin);
    const pinVerify = await VaultCrypto.hashPin(pin);

    await SafeStorage.set(STORAGE_KEY_PAYLOAD, encrypted);
    await SafeStorage.set(STORAGE_KEY_PIN_VERIFY, pinVerify);

    const meta: VaultMetadata = {
      isConfigured: true,
      isLocked: false,
      inactivityLockMinutes: 15,
      lastUnlockedTimestamp: Date.now(),
    };
    await SafeStorage.set(STORAGE_KEY_META, meta);

    this.cachedData = data;
    this.cachedPin = pin;
    this.lastActivityTimestamp = Date.now();
  }

  /**
   * Unlock vault with user PIN
   */
  static async unlock(pin: string): Promise<VaultData> {
    const payload = await SafeStorage.get<EncryptedVaultPayload | null>(STORAGE_KEY_PAYLOAD, null);
    if (!payload) {
      throw new Error('No vault configured yet.');
    }

    // Attempt decryption
    const decrypted = await VaultCrypto.decrypt<VaultData>(payload, pin);

    this.cachedData = decrypted;
    this.cachedPin = pin;
    this.lastActivityTimestamp = Date.now();

    const meta = await SafeStorage.get<VaultMetadata>(STORAGE_KEY_META, {
      isConfigured: true,
      isLocked: false,
      inactivityLockMinutes: 15,
      lastUnlockedTimestamp: Date.now(),
    });
    meta.isLocked = false;
    meta.lastUnlockedTimestamp = Date.now();
    await SafeStorage.set(STORAGE_KEY_META, meta);

    return decrypted;
  }

  /**
   * Lock vault and purge plaintext data from memory
   */
  static lock(): void {
    this.cachedData = null;
    this.cachedPin = null;
  }

  /**
   * Retrieve decrypted data (must be unlocked)
   */
  static async getData(): Promise<VaultData> {
    if (await this.isLocked() || !this.cachedData) {
      throw new Error('Vault is locked. Please unlock first.');
    }
    this.touch();
    return this.cachedData;
  }

  /**
   * Save updated vault data, re-encrypting with current PIN
   */
  static async saveData(data: VaultData): Promise<void> {
    if (!this.cachedPin) {
      throw new Error('Cannot save data to locked vault.');
    }

    const encrypted = await VaultCrypto.encrypt(data, this.cachedPin);
    await SafeStorage.set(STORAGE_KEY_PAYLOAD, encrypted);
    this.cachedData = data;
    this.touch();
  }

  /**
   * Update a specific field within a category
   */
  static async updateField(
    category: 'personal' | 'address' | 'education' | 'professional',
    key: string,
    value: string
  ): Promise<void> {
    const data = await this.getData();
    const cat = (data[category] as unknown) as Record<string, string>;
    cat[key] = value;
    await this.saveData(data);
  }

  /**
   * Add or update a custom field
   */
  static async upsertCustomField(field: Omit<CustomField, 'id'> & { id?: string }): Promise<void> {
    const data = await this.getData();
    if (field.id) {
      const idx = data.customFields.findIndex((f) => f.id === field.id);
      if (idx >= 0) {
        data.customFields[idx] = { ...data.customFields[idx], ...field };
      } else {
        data.customFields.push({ ...field, id: field.id });
      }
    } else {
      const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      data.customFields.push({ ...field, id });
    }
    await this.saveData(data);
  }

  /**
   * Delete a custom field by ID
   */
  static async deleteCustomField(id: string): Promise<void> {
    const data = await this.getData();
    data.customFields = data.customFields.filter((f) => f.id !== id);
    await this.saveData(data);
  }

  /**
   * Clear all vault data and reset
   */
  static async clearVault(): Promise<void> {
    this.lock();
    await SafeStorage.remove(STORAGE_KEY_PAYLOAD);
    await SafeStorage.remove(STORAGE_KEY_META);
    await SafeStorage.remove(STORAGE_KEY_PIN_VERIFY);
  }

  /**
   * Change user PIN
   */
  static async changePin(oldPin: string, newPin: string): Promise<void> {
    await this.unlock(oldPin);
    const data = await this.getData();
    await this.setupVault(newPin, data);
  }
}
