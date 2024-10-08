import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QRCodeDocument = QRCode & Document;

@Schema({ collection: '_qrqrcodes' })
export class QRCode {

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId: Types.ObjectId;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  allowedRange: number; 
}

export const QRCodeSchema = SchemaFactory.createForClass(QRCode);
