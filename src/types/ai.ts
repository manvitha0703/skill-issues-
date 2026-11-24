export type AIProvider =
  | 'local_deterministic'
  | 'local_ollama'
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'custom';

export type WebpageCategory =
  | 'news'
  | 'education'
  | 'government'
  | 'ecommerce'
  | 'healthcare'
  | 'general';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint?: string;
  enabled: boolean;
  localOnlyMode: boolean; // Enforce zero cloud telemetry / zero outbound transmission
  maxTokens?: number;
  temperature?: number;
}

export type SimplificationLevel = 'very_simple' | 'simple' | 'standard' | 'detailed';

export interface AISimplifyRequest {
  text: string;
  level: SimplificationLevel;
  preserveContext?: boolean;
}

export interface AISimplifyResponse {
  simplifiedText: string;
  keyPoints: string[];
  difficultWordsExplained: Array<{ word: string; explanation: string }>;
  isAiGenerated: boolean;
}

export interface AITranslateRequest {
  text: string;
  targetLanguage: string; // 'hi', 'kn', 'ta', 'te', 'ml', 'bn', 'mr', 'en'
  sourceLanguage?: string;
}

export interface AITranslateResponse {
  translatedText: string;
  targetLanguage: string;
  isAiGenerated: boolean;
}

export interface AIPageSummaryRequest {
  pageTitle: string;
  headings: string[];
  mainTextSnippet: string;
  formsCount: number;
  linksCount: number;
  summaryLength?: 'brief' | 'standard' | 'detailed';
}

export interface AIPageSummaryResponse {
  summary: string;
  pageType: WebpageCategory;
  primaryAction: string;
  importantDatesOrDeadlines: string[];
  keySections: string[];
  isAiGenerated: boolean;
}

export interface AIImageDescriptionRequest {
  imageUrl?: string;
  imageAlt?: string;
  contextText?: string;
}

export interface AIImageDescriptionResponse {
  description: string;
  confidence: number;
  isAiGenerated: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  contextSnippet?: string;
}
