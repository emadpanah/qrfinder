import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema({ collection: '_qrshops' })
export class Shop {
  // @Prop({ type: Types.ObjectId, auto: true })
  // _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [Types.ObjectId], ref: 'Campaign' }) // Array of campaign IDs
  campaigns: Types.ObjectId[];
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
