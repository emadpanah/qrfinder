import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementSelectedDocument = AchievementSelected & Document;

@Schema({ collection: '_qrachievementselected' })
export class AchievementSelected {

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  inviteLink: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  parentId: Types.ObjectId;  // This field will store the parent user who referred this achievement

  @Prop({ type: Date, default: Date.now })
  addedDate: Date;  // This field will store the date when the achievement was added

}

const AchievementSelectedSchema = SchemaFactory.createForClass(AchievementSelected);
 
// Create a unique index on achievementId and userId
AchievementSelectedSchema.index({ achievementId: 1, userId: 1 }, { unique: true });

export { AchievementSelectedSchema };