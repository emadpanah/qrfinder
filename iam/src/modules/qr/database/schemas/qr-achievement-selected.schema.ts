import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementSelectedDocument = AchievementSelected & Document;

@Schema({ collection: '_qrachievementselected' })
export class AchievementSelected {

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'IAMUser', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'IAMUser', default: null })
  parentId: Types.ObjectId;  

  @Prop({ type: Number, default: Date.now })
  addedDate: Number;  

  @Prop({ type: Number, default: Date.now })
  doneDate: Number;
}

const AchievementSelectedSchema = SchemaFactory.createForClass(AchievementSelected);
 
// Create a unique index on achievementId and userId
AchievementSelectedSchema.index({ achievementId: 1, userId: 1 }, { unique: true });

export { AchievementSelectedSchema };