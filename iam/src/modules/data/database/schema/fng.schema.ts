import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: '_fngdata' })
export class FngData {
  @Prop()
  name: string;

  @Prop()
  value: string;

  @Prop()
  value_classification: string;

  @Prop()
  timestamp: number;

  @Prop()
  time_until_update?: string;

  @Prop({ type: Object, default: { error: null } })
  metadata: {
    error: any;
  };
}

export type FngDataDocument = FngData & Document;
export const FngDataSchema = SchemaFactory.createForClass(FngData);

// Set TTL index to automatically delete documents after 15 days
FngDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 });
