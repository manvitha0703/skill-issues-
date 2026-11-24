var v = Object.defineProperty;
var T = (o, e, t) => e in o ? v(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var i = (o, e, t) => T(o, typeof e != "symbol" ? e + "" : e, t);
class c {
  static isChromeStorageAvailable() {
    return typeof chrome < "u" && !!chrome.storage && !!chrome.storage.local;
  }
  static async get(e, t) {
    if (this.isChromeStorageAvailable())
      return new Promise((s) => {
        chrome.storage.local.get([e], (a) => {
          chrome.runtime.lastError ? (console.warn(`SafeStorage get error for key "${e}":`, chrome.runtime.lastError), s(t)) : s(a[e] !== void 0 ? a[e] : t);
        });
      });
    if (typeof window < "u" && window.localStorage)
      try {
        const s = window.localStorage.getItem(e);
        return s === null ? t : JSON.parse(s);
      } catch (s) {
        return console.warn(`LocalStorage read error for key "${e}":`, s), t;
      }
    return t;
  }
  static async set(e, t) {
    if (this.isChromeStorageAvailable())
      return new Promise((s, a) => {
        chrome.storage.local.set({ [e]: t }, () => {
          chrome.runtime.lastError ? a(chrome.runtime.lastError) : s();
        });
      });
    if (typeof window < "u" && window.localStorage)
      try {
        window.localStorage.setItem(e, JSON.stringify(t));
      } catch (s) {
        console.warn(`LocalStorage write error for key "${e}":`, s);
      }
  }
  static async remove(e) {
    if (this.isChromeStorageAvailable())
      return new Promise((t) => {
        chrome.storage.local.remove([e], () => {
          t();
        });
      });
    typeof window < "u" && window.localStorage && window.localStorage.removeItem(e);
  }
  static async clear() {
    if (this.isChromeStorageAvailable())
      return new Promise((e) => {
        chrome.storage.local.clear(() => {
          e();
        });
      });
    typeof window < "u" && window.localStorage && window.localStorage.clear();
  }
}
function w(o) {
  const e = o instanceof Uint8Array ? o : new Uint8Array(o);
  let t = "";
  for (let s = 0; s < e.byteLength; s++)
    t += String.fromCharCode(e[s]);
  return btoa(t);
}
function y(o) {
  const e = atob(o), t = new Uint8Array(e.length);
  for (let s = 0; s < e.length; s++)
    t[s] = e.charCodeAt(s);
  return t;
}
class d {
  /**
   * Derives an AES-GCM 256-bit key from a user PIN/passphrase and salt using PBKDF2
   */
  static async deriveKey(e, t) {
    const a = new TextEncoder().encode(e), r = await crypto.subtle.importKey(
      "raw",
      a,
      "PBKDF2",
      !1,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: t,
        iterations: this.ITERATIONS,
        hash: "SHA-256"
      },
      r,
      {
        name: "AES-GCM",
        length: 256
      },
      !1,
      ["encrypt", "decrypt"]
    );
  }
  /**
   * Encrypts plaintext JSON data with a PIN
   */
  static async encrypt(e, t) {
    const s = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH)), a = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH)), r = await this.deriveKey(t, s), l = new TextEncoder().encode(JSON.stringify(e)), g = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: a
      },
      r,
      l
    );
    return {
      version: 1,
      salt: w(s),
      iv: w(a),
      ciphertext: w(g),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Decrypts an EncryptedVaultPayload using the user PIN.
   * Throws an error if the PIN is incorrect or payload is tampered with.
   */
  static async decrypt(e, t) {
    const s = y(e.salt), a = y(e.iv), r = y(e.ciphertext), n = await this.deriveKey(t, s);
    try {
      const l = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: a
        },
        n,
        r
      ), S = new TextDecoder().decode(l);
      return JSON.parse(S);
    } catch {
      throw new Error("Invalid vault PIN or corrupted vault data.");
    }
  }
  /**
   * Generates a verification hash to quickly check if a PIN matches without decrypting full data
   */
  static async hashPin(e, t) {
    const s = t ? y(t) : crypto.getRandomValues(new Uint8Array(16)), r = new TextEncoder().encode(e), n = await crypto.subtle.importKey(
      "raw",
      r,
      "PBKDF2",
      !1,
      ["deriveBits"]
    ), l = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: s,
        iterations: 5e4,
        hash: "SHA-256"
      },
      n,
      256
    );
    return {
      hash: w(l),
      salt: w(s)
    };
  }
}
i(d, "SALT_LENGTH", 16), i(d, "IV_LENGTH", 12), // Standard recommended IV length for AES-GCM
i(d, "ITERATIONS", 1e5);
const f = "swde_vault_payload", h = "swde_vault_metadata", p = "swde_vault_pin_verify", m = {
  personal: {
    firstName: "",
    lastName: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: ""
  },
  address: {
    addressLine: "",
    city: "",
    state: "",
    country: "",
    pinCode: ""
  },
  education: {
    school: "",
    college: "",
    university: "",
    course: "",
    degree: "",
    graduationYear: "",
    studentId: "",
    gpaCgpa: ""
  },
  professional: {
    jobTitle: "",
    skills: "",
    workExperience: "",
    organization: "",
    resumeDetails: ""
  },
  customFields: []
};
class u {
  /**
   * Check if user has initialized the vault with a PIN
   */
  static async isConfigured() {
    const e = await c.get(h, null);
    return !!(e != null && e.isConfigured);
  }
  /**
   * Check if vault is currently locked
   */
  static async isLocked() {
    if (!await this.isConfigured()) return !1;
    if (!this.cachedData || !this.cachedPin) return !0;
    const t = await c.get(h, null), s = ((t == null ? void 0 : t.inactivityLockMinutes) || 15) * 60 * 1e3;
    return Date.now() - this.lastActivityTimestamp > s ? (this.lock(), !0) : !1;
  }
  /**
   * Touch activity timer to prevent premature inactivity lock
   */
  static touch() {
    this.lastActivityTimestamp = Date.now();
  }
  /**
   * Initial vault setup: sets master PIN and initial data
   */
  static async setupVault(e, t) {
    if (!e || e.length < 4)
      throw new Error("PIN must be at least 4 characters.");
    const s = {
      ...m,
      ...t,
      personal: { ...m.personal, ...(t == null ? void 0 : t.personal) || {} },
      address: { ...m.address, ...(t == null ? void 0 : t.address) || {} },
      education: { ...m.education, ...(t == null ? void 0 : t.education) || {} },
      professional: { ...m.professional, ...(t == null ? void 0 : t.professional) || {} },
      customFields: (t == null ? void 0 : t.customFields) || []
    }, a = await d.encrypt(s, e), r = await d.hashPin(e);
    await c.set(f, a), await c.set(p, r);
    const n = {
      isConfigured: !0,
      isLocked: !1,
      inactivityLockMinutes: 15,
      lastUnlockedTimestamp: Date.now()
    };
    await c.set(h, n), this.cachedData = s, this.cachedPin = e, this.lastActivityTimestamp = Date.now();
  }
  /**
   * Unlock vault with user PIN
   */
  static async unlock(e) {
    const t = await c.get(f, null);
    if (!t)
      throw new Error("No vault configured yet.");
    const s = await d.decrypt(t, e);
    this.cachedData = s, this.cachedPin = e, this.lastActivityTimestamp = Date.now();
    const a = await c.get(h, {
      isConfigured: !0,
      isLocked: !1,
      inactivityLockMinutes: 15,
      lastUnlockedTimestamp: Date.now()
    });
    return a.isLocked = !1, a.lastUnlockedTimestamp = Date.now(), await c.set(h, a), s;
  }
  /**
   * Lock vault and purge plaintext data from memory
   */
  static lock() {
    this.cachedData = null, this.cachedPin = null;
  }
  /**
   * Retrieve decrypted data (must be unlocked)
   */
  static async getData() {
    if (await this.isLocked() || !this.cachedData)
      throw new Error("Vault is locked. Please unlock first.");
    return this.touch(), this.cachedData;
  }
  /**
   * Save updated vault data, re-encrypting with current PIN
   */
  static async saveData(e) {
    if (!this.cachedPin)
      throw new Error("Cannot save data to locked vault.");
    const t = await d.encrypt(e, this.cachedPin);
    await c.set(f, t), this.cachedData = e, this.touch();
  }
  /**
   * Update a specific field within a category
   */
  static async updateField(e, t, s) {
    const a = await this.getData(), r = a[e];
    r[t] = s, await this.saveData(a);
  }
  /**
   * Add or update a custom field
   */
  static async upsertCustomField(e) {
    const t = await this.getData();
    if (e.id) {
      const s = t.customFields.findIndex((a) => a.id === e.id);
      s >= 0 ? t.customFields[s] = { ...t.customFields[s], ...e } : t.customFields.push({ ...e, id: e.id });
    } else {
      const s = "custom_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
      t.customFields.push({ ...e, id: s });
    }
    await this.saveData(t);
  }
  /**
   * Delete a custom field by ID
   */
  static async deleteCustomField(e) {
    const t = await this.getData();
    t.customFields = t.customFields.filter((s) => s.id !== e), await this.saveData(t);
  }
  /**
   * Clear all vault data and reset
   */
  static async clearVault() {
    this.lock(), await c.remove(f), await c.remove(h), await c.remove(p);
  }
  /**
   * Change user PIN
   */
  static async changePin(e, t) {
    await this.unlock(e);
    const s = await this.getData();
    await this.setupVault(t, s);
  }
}
i(u, "cachedData", null), i(u, "cachedPin", null), i(u, "lastActivityTimestamp", Date.now());
chrome.runtime.onInstalled.addListener(async (o) => {
  o.reason === "install" && (await c.get("swde_onboarding_complete", !1) || chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") })), chrome.contextMenus.create({
    id: "swde-simplify-selection",
    title: "✨ Simplify Selected Text",
    contexts: ["selection"]
  }), chrome.contextMenus.create({
    id: "swde-read-selection",
    title: "🔊 Read Selection Aloud",
    contexts: ["selection"]
  });
});
chrome.contextMenus.onClicked.addListener((o, e) => {
  e != null && e.id && (o.menuItemId === "swde-simplify-selection" && o.selectionText ? chrome.tabs.sendMessage(e.id, {
    type: "SPEAK_TEXT",
    payload: `Simplifying: ${o.selectionText}`
  }) : o.menuItemId === "swde-read-selection" && o.selectionText && chrome.tabs.sendMessage(e.id, {
    type: "SPEAK_TEXT",
    payload: o.selectionText
  }));
});
chrome.runtime.onMessage.addListener((o, e, t) => {
  if (o.type === "GET_VAULT_STATUS")
    return (async () => {
      const s = await u.isConfigured(), a = await u.isLocked();
      let r = null;
      if (s && !a)
        try {
          r = await u.getData();
        } catch {
        }
      t({ isConfigured: s, isLocked: a, vaultData: r });
    })(), !0;
});
