import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementSelectedDocument = AchievementSelected & Document;

@Schema({ collection: '_qrachievementselecteds' })
export class AchievementSelected {
  @Prop({ type: Types.ObjectId, auto: true })
  Id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  qrCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement
}

export const AchievementSelectedSchema = SchemaFactory.createForClass(AchievementSelected);
