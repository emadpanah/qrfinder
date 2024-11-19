import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_dominancedata' })
export class DominanceData {
  @Prop()
  symbol: string;

  @Prop()
  dominance: number;

  @Prop()
  time: number;

  @Prop({ type: Object, default: { error: null } })
  metadata?: {
    error: any;
  };
}

export type DominanceDataDocument = DominanceData & Document;
export const DominanceDataSchema = SchemaFactory.createForClass(DominanceData);

// Set TTL index to automatically delete documents after 30 days
DominanceDataSchema.index({ time: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
