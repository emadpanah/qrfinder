import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QRScanQrDocument = QRScanQr & Document;

@Schema({ collection: '_qrscanqr' })
export class QRScanQr {

  @Prop({ type: Types.ObjectId, ref: 'QRCode', required: true })
  qrCodeId: Types.ObjectId;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;

  @Prop({ type: Types.ObjectId, ref: 'IAMUser', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, default: Date.now })
  addedDate: Number;

}


const QRScanSchema = SchemaFactory.createForClass(QRScanQr);

QRScanSchema.index({ qrCodeId: 1, userId: 1 }, { unique: true });

export { QRScanSchema };