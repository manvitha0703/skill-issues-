import { UserAccessibilityState, AccessibilityProfile } from './profile';
import { FieldMatchResult, FormDetectionSummary } from './form';
import { AIPageSummaryResponse, WebpageCategory } from './ai';

export type ExtensionMessageType =
  | 'GET_ACCESSIBILITY_STATE'
  | 'UPDATE_ACCESSIBILITY_STATE'
  | 'APPLY_PROFILE'
  | 'TOGGLE_MASTER_ACCESSIBILITY'
  | 'ANALYZE_PAGE'
  | 'PAGE_ANALYSIS_RESULT'
  | 'DETECT_FORMS'
  | 'DETECT_FORMS_RESULT'
  | 'FILL_FORM_FIELDS'
  | 'FILL_FORM_FIELDS_RESULT'
  | 'CLEAR_FILLED_FIELDS'
  | 'OPEN_READING_MODE'
  | 'CLOSE_READING_MODE'
  | 'TOGGLE_READING_RULER'
  | 'SPEAK_TEXT'
  | 'STOP_SPEAKING'
  | 'GET_VAULT_STATUS'
  | 'REQUEST_VAULT_UNLOCK'
  | 'VAULT_LOCKED_STATUS'
  | 'START_SYNCHRONIZED_NARRATION'
  | 'STOP_SYNCHRONIZED_NARRATION'
  | 'TRANSLATE_PAGE_LOCAL'
  | 'RESTORE_PAGE_LOCAL'
  | 'SCAN_IMAGES_OCR';

export interface ExtensionMessage<T = unknown> {
  type: ExtensionMessageType;
  payload?: T;
}

export interface PageOverviewData {
  title: string;
  url: string;
  domain: string;
  category: WebpageCategory;
  headings: string[];
  sectionsCount: number;
  formsCount: number;
  buttonsCount: number;
  linksCount: number;
  imagesCount: number;
  imagesMissingAlt: number;
  hasAudioVideo: boolean;
  hasAnimations: boolean;
  readingTimeMinutes: number;
  summary: AIPageSummaryResponse | null;
}
