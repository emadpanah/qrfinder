import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ collection: '_qrcampaigns' })
export class Campaign {

    @Prop({ type: Types.ObjectId, auto: true })
    Id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
  shopId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [Types.ObjectId], ref: 'Achievement' }) // Array of achievement IDs
  achievements: Types.ObjectId[];

  @Prop({ required: true })
  expirationDate: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
