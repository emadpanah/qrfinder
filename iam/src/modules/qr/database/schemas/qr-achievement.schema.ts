import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ collection: '_qrachievements' })
export class Achievement {

  @Prop({ type: Types.ObjectId, auto: true })
  Id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: 'ordered' | 'unordered';

  @Prop({ required: true })
  target: number;

  @Prop({ type: Object, required: true })
  reward: {
    tokens: number;
    products: string[];
  };

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({
    type: Object,
    required: true,
  })
  expectedLocation: {
    lat: number;
    lon: number;
    allowedRange: number;
  };
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
