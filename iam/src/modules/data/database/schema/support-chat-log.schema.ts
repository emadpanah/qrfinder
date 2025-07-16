// support-chat-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, collection: '_supportchatlogdata' })
export class SupportChatLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  telegramId: string;

  @Prop({ required: true })
  chatId: string;

  @Prop({ required: true })
  query: string;

  @Prop({ required: true })
  response: string;

  @Prop()
  calledFunction: string;

  @Prop({ type: Object })
  parameters: Record<string, any>;

  @Prop({ type: Object })
  newParameters: Record<string, any>;

  @Prop({ required: true })
  save_at: number;

  @Prop()
  conversationId: string;

  @Prop()
  isResolved: boolean;

  @Prop()
  resolutionNote: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ enum: ['telegram', 'web', 'email', 'whatsapp'] })
  source: 'telegram' | 'web' | 'email' | 'whatsapp';

  @Prop()
  rating: number;
}

export type SupportChatLogDocument = SupportChatLog & Document;
export const SupportChatLogSchema = SchemaFactory.createForClass(SupportChatLog);

// Add index for better performance on queries
SupportChatLogSchema.index({ telegramId: 1, save_at: -1 });
