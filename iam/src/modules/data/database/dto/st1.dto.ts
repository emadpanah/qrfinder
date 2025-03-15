import { ObjectId, Types } from "mongoose";

export class ST1Dto {
    _id:  Types.ObjectId;
    signal: string;
    exchange: string;
    symbol: string;
    price: number;
    time: number;
    target?: number;
    stop?: number;
    isDone?: boolean;
  }
  