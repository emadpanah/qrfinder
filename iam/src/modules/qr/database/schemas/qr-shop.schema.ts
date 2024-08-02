import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema({ collection: '_qrshops' })
export class Shop {
 
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  shopId : string;

}

export const ShopSchema = SchemaFactory.createForClass(Shop);
