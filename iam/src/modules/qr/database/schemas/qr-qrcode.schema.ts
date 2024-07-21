import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QRCodeDocument = QRCode & Document;

@Schema()
export class QRCode {

  @Prop({ type: Types.ObjectId, auto: true })
  Id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  expirationDate: Date;

  @Prop({ required: true })
  allowedRange: number; // Added allowedRange property
}

export const QRCodeSchema = SchemaFactory.createForClass(QRCode);
