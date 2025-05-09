// iam/database/schemas/user-login-info.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserLoginDocument = UserLogin & Document;

@Schema({ collection: '_userlogins' })
export class UserLogin {
  @Prop({ type: Types.ObjectId, ref: 'IAMUser', required: true })
  userId: Types.ObjectId;

  @Prop({ unique: true, required: true })
  token: string;

  @Prop({ required: true, default: Date.now })
  loginDate: Date;

  @Prop({ type: String, required: false }) 
  shopToken: string;

  @Prop({ type: String, required: false })
  chatId: string;

}

export const UserLoginSchema = SchemaFactory.createForClass(UserLogin);
