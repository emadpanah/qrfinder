import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DIDDocument = HydratedDocument<DID>;

@Schema()
export class DID {
  @Prop()
  username: string;

  @Prop()
  metamaskId: string;

}

export const DIDSchema = SchemaFactory.createForClass(DID);