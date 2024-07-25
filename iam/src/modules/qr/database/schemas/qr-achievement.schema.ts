import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ collection: '_qrachievements' })
export class Achievement {

  // @Prop({ type: Types.ObjectId, auto: true })
  // _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: 'ordered' | 'unordered';

  @Prop({ type: Object, required: true })
  reward: {
    tokens: number;
    products: string[];
  };

  @Prop({ required: true })
  expirationDate: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
