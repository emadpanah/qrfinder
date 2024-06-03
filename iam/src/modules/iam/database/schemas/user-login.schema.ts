// iam/database/schemas/user-login-info.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserLoginDocument = UserLogin & Document;

@Schema({ collection: '_userlogins' })
export class UserLogin {
  @Prop({ unique: true, required: true, minlength: 42, maxlength: 100 })
  ethAddress: string; // Or any other unique identifier for the user

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, default: Date.now })
  loginDate: Date;
}

export const UserLoginSchema = SchemaFactory.createForClass(UserLogin);
