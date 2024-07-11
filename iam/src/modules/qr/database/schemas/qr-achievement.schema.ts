import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ collection: '_qrachievements' })
export class Achievement {
  @Prop({ type: Types.ObjectId, ref: 'Campaign', required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: 'ordered' | 'unordered'; // Type of achievement

  @Prop({ required: true })
  target: number;

  @Prop({ required: true })
  reward: {
    tokens: number;
    products: string[];
  };

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  expectedLocation: {
    lat: number;
    lon: number;
    allowedRange: number; // in meters
  };
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
