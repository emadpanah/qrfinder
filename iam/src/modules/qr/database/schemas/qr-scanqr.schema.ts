import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QRScanQrDocument = QRScanQr & Document;

@Schema({ collection: '_qrscanqr' })
export class QRScanQr {

  @Prop({ type: Types.ObjectId, ref: 'QrCode', required: true })
  qrCodeId: Types.ObjectId;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

}

const QRScanSchema = SchemaFactory.createForClass(QRScanQr);

QRScanSchema.index({ qrCodeId: 1, userId: 1 }, { unique: true });

export { QRScanSchema };