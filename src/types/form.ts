export interface DetectedFormField {
  id: string; // unique identifier in the DOM
  name: string;
  tagName: 'input' | 'textarea' | 'select';
  type: string; // text, email, tel, date, number, checkbox, radio, select-one, etc.
  label: string;
  placeholder: string;
  ariaLabel: string;
  autocomplete: string;
  surroundingText: string;
  selector: string;
  currentValue: string;
  options?: Array<{ value: string; label: string }>;
  isRequired: boolean;
  isDisabled: boolean;
}

export interface FieldMatchResult {
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  suggestedValue: string;
  vaultKeyPath: string; // e.g. 'personal.fullName', 'education.college'
  vaultLabel: string; // e.g. 'Full Name', 'College'
  confidence: number; // 0.0 to 1.0
  source: 'exact' | 'alias' | 'semantic' | 'ai';
  approved: boolean; // default true for confidence > 0.6
  selector: string;
}

export interface FormDetectionSummary {
  formId?: string;
  formSelector: string;
  formName?: string;
  totalFieldsCount: number;
  matchedFieldsCount: number;
  unmatchedFieldsCount: number;
  matches: FieldMatchResult[];
  unmatched: DetectedFormField[];
}
