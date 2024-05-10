// iam/database/schemas/iam-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type IAMUserDocument = IAMUser & Document;

@Schema()
export class IAMUser {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;
}

export const IAMUserSchema = SchemaFactory.createForClass(IAMUser);
