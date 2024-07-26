// src/modules/qr/database/schemas/qr-campaign.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ collection: '_qrcampaigns' })
export class Campaign {

  @Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
  shopId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  ownerTelegramId: string;

  @Prop({ required: true })
  ownerAddress: string;

  @Prop({ required: true })
  target: number;

  @Prop({ type: Object, required: true })
  reward: {
    tokens: number;
    products: string[];
  };

}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
