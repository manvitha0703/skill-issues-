export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  email: string;
  phone: string;
}

export interface AddressInfo {
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

export interface EducationInfo {
  school: string;
  college: string;
  university: string;
  course: string;
  degree: string;
  graduationYear: string;
  studentId: string;
  gpaCgpa: string;
}

export interface ProfessionalInfo {
  jobTitle: string;
  skills: string;
  workExperience: string;
  organization: string;
  resumeDetails: string;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
  category: 'personal' | 'academic' | 'professional' | 'other';
}

export interface VaultData {
  personal: PersonalInfo;
  address: AddressInfo;
  education: EducationInfo;
  professional: ProfessionalInfo;
  customFields: CustomField[];
}

export interface EncryptedVaultPayload {
  version: number;
  salt: string; // base64
  iv: string;   // base64
  ciphertext: string; // base64
  updatedAt: string;
}

export interface VaultMetadata {
  isConfigured: boolean;
  isLocked: boolean;
  inactivityLockMinutes: number; // e.g. 15 mins
  lastUnlockedTimestamp: number | null;
}
