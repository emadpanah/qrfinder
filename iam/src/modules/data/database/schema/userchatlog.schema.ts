import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false, collection: '_userchatlogdata' }) // Disable default Mongoose timestamps
export class UserChatLog {
  @Prop({ required: true })
  telegramId: string;

  @Prop({ required: true })
  query: string;

  @Prop()
  response: string;

  @Prop()
  calledFunction: string;

  @Prop({ type: Object })
  parameters: Record<string, any>;

  @Prop({ type: Object })
  newParameters: Record<string, any>;

  @Prop({ default: 'in-scope' })
  queryType: 'in-scope' | 'out-of-scope';

  @Prop({ required: true }) // Store as Unix timestamp
  save_at: number;
}

export type UserChatLogDocument = UserChatLog & Document;
export const UserChatLogSchema = SchemaFactory.createForClass(UserChatLog);

UserChatLogSchema.index({ telegramId: 1, save_at: -1 });