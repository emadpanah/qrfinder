// src/modules/data/database/schema/lunarcrush-news.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_lunarpublicnewsdata' })
export class LunarCrushNews {
  @Prop({ unique: true, required: true })
  id: string; // This is the unique post_id like 'zycrypto.com-3681083677'

  @Prop()
  post_type: string;

  @Prop()
  post_title: string;

  @Prop()
  post_link: string;

  @Prop()
  post_image: string;

  @Prop()
  post_created: number;

  @Prop()
  post_sentiment: number;

  @Prop()
  creator_id: string;

  @Prop()
  creator_name: string;

  @Prop()
  creator_display_name: string;

  @Prop()
  creator_followers: number;

  @Prop()
  creator_avatar: string;

  @Prop()
  interactions_24h: number;

  @Prop()
  interactions_total: number;

  @Prop()
  fetched_at: number;
}

export type LunarCrushNewsDocument = LunarCrushNews & Document;
export const LunarCrushNewsSchema = SchemaFactory.createForClass(LunarCrushNews);
// Add indexes
LunarCrushNewsSchema.index({ id: 1 }, { unique: true });              
LunarCrushNewsSchema.index({ interactions_24h: -1 });                 
LunarCrushNewsSchema.index({ post_title: 'text' });                   
LunarCrushNewsSchema.index({ interactions_24h: -1, post_title: 'text' }); 