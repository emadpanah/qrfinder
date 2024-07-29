import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ collection: '_qrachievements' })
export class Achievement {

  @Prop({ type: Types.ObjectId, required: true })
  campaignId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  qrTarget: number;

  @Prop({ required: true })
  qrOrderType: 'ordered' | 'unordered';

  @Prop({ type: Boolean, required: true })
  qrProofByLocation: boolean;

  @Prop({ required: true })
  achievementType: 'qrcode' | 'taptoken' | 'bet' | 'dailyvisit' | 'vote' | 'inviteuser';

  @Prop({ type: Object, required: true })
  reward: {
    tokens: number;
    products: string[];
  };

  @Prop({ required: true })
  expirationDate: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
