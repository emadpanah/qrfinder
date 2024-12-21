// iam/database/schemas/iam-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IAMUserDocument = IAMUser & Document;

@Schema({ collection: '_iamusers' })
export class IAMUser {
  @Prop({ unique: true, required: false })
  telegramID: string;

  @Prop({ required: false })
  telegramFirstName: string;

  @Prop({ required: false })
  mobile: string;

  @Prop({ required: false })
  telegramLastName: string;

  @Prop({ required: false })
  telegramUserName: string;

  @Prop({ required: false })
  telegramLanCode: string;

  @Prop({ required: true, default: Date.now })
  createdDate: Date;
}

export const IAMUserSchema = SchemaFactory.createForClass(IAMUser);
