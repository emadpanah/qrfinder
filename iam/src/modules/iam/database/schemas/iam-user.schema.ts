// iam/database/schemas/iam-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IAMUserDocument = IAMUser & Document;

@Schema({ collection: '_iamusers' })
export class IAMUser {
  @Prop({ unique: true, required: true, minlength: 42, maxlength: 100 })
  ethAddress: string;

  @Prop({ required: true, minlength: 3, maxlength: 50 })
  walletType: string;

  @Prop({ required: true, default: Date.now })
  createdDate: Date;
}

export const IAMUserSchema = SchemaFactory.createForClass(IAMUser);
