import { describe, it, expect } from 'vitest';
import { VaultCrypto } from '../crypto';

describe('VaultCrypto Web Crypto API', () => {
  it('encrypts and decrypts complex data successfully with the correct PIN', async () => {
    const originalData = {
      fullName: 'Dr. John Doe',
      email: 'john.doe@example.org',
      pinCode: '560057',
      skills: ['Accessibility', 'React', 'TypeScript'],
      customFields: [{ id: '1', name: 'Blood Group', value: 'O+' }]
    };

    const pin = 'Secure1234!';
    const encrypted = await VaultCrypto.encrypt(originalData, pin);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.salt).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.version).toBe(1);

    const decrypted = await VaultCrypto.decrypt<typeof originalData>(encrypted, pin);
    expect(decrypted).toEqual(originalData);
  });

  it('rejects decryption when given an incorrect PIN', async () => {
    const secret = { secretNote: 'Top secret accessibility research' };
    const encrypted = await VaultCrypto.encrypt(secret, 'CorrectPIN99');

    await expect(VaultCrypto.decrypt(encrypted, 'WrongPIN00')).rejects.toThrow(
      /Invalid vault PIN or corrupted vault data/
    );
  });

  it('generates consistent verification hash for PIN with same salt', async () => {
    const pin = 'SecretVaultPin';
    const first = await VaultCrypto.hashPin(pin);
    const second = await VaultCrypto.hashPin(pin, first.salt);

    expect(second.hash).toBe(first.hash);
  });
});
