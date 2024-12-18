// src/modules/data/database/schema/translations.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_translationsdata' })
export class Translation {
  @Prop({ unique: true, required: true })
  id: string; // Unique identifier, e.g., 'news-123'

  @Prop({ required: true })
  original_text: string; // The original text for translation

  @Prop({ type: Map, of: String }) // Store translations as a map of language to text
  translations: Map<string, string>;

  @Prop({ type: Date })
  created_at?: Date; // Optional: Track when the translation was added

  @Prop({ type: Date })
  updated_at?: Date; // Optional: Track when it was last updated
}

export type TranslationDocument = Translation & Document;
export const TranslationSchema = SchemaFactory.createForClass(Translation);

// Add index for efficient lookups by id
TranslationSchema.index({ id: 1 }, { unique: true });
