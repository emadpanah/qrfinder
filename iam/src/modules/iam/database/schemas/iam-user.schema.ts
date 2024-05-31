// iam/database/schemas/iam-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type IAMUserDocument = IAMUser & Document;

@Schema()
export class IAMUser {
  @Prop({ unique: true, required: true, minlength: 42, maxlength: 100 })
  ethAddress: string;

  @Prop({ unique: true, required: true, default: uuidv4 })
  userId: string;

  @Prop({ required: true, minlength: 8, maxlength: 20 })
  walletType: string;

  @Prop({ required: true, default: Date.now })
  createdDate: Date;
}

export const IAMUserSchema = SchemaFactory.createForClass(IAMUser);
