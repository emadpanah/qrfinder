// src/modules/data/dto/translation.dto.ts
export class TranslationDto {
    id: string; // Content ID (e.g., 'news-123')
    original_text: string; // The original content text
    language: string; // Target language code (e.g., 'fa')
    translated_text?: string; // Optional: If available, the translated text
  }
  