import { Types } from 'mongoose';

// app/lib/definitions.ts
export interface Campaign {
  shopId: string;
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  expirationDate?: number;
  target?: number;
  reward: {
    tokens: number;
    products: string[];
  };
  ownerTelegramId: string;
  ownerAddress: string;
}

export interface Achievement {
  campaignId: string;
  _id: string;
  name: string;
  description: string;
  reward: {
    tokens: number;
    products: string[];
  };
  qrTarget: number;
  expirationDate: number;
  startDate: number;
  enable: boolean;
  addedDate: number;
  qrOrderType: 'ordered' | 'unordered';
  achievementType:
    | 'qrcode'
    | 'taptoken'
    | 'bet'
    | 'dailyvisit'
    | 'vote'
    | 'inviteuser';
}

export interface QRCode {
  _id: string;
  achievementId: string;
  link: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface QRScanFull {
  _id: string;
  qrCodeId: string;
  userId: string;
  lat: number;
  lon: number;
  link: string;
  order: number;
}

export interface AchievementSelectedFull {
  _id: string;
  achievementId: string;
  name: string;
  reward: {
    tokens: number;
    products: string[];
  };
  expirationDate: number;
  userId: string;
  inviteLink: string;
  parentId: string;
  addedDate: number;
  description: string;
  qrOrderType: string;
  achievementType: string;
  qrProofByLocation: boolean;
  campaignId: string;
  qrTarget: number;
  startDate: number;
}

export interface Balance {
  userId: string;
  transactionType: string;
  amount: number;
  currency: string;
  transactionEntityId: string;
  timestamp: number;
  balanceAfterTransaction: number;
  _id: string;
}

export interface Currency {
  _id: string;
  name: string;
  symbol: string;
  type: string;
  isDefault: boolean;
}

export interface AccountType {
  // address: string | null;
  // balance: string | null;
  // chainId: string | null;
  // network: string | null;
  userId: string | null;
  gbalance: string | null;
}

export interface TapGameModel {
  id: number;
  title: string;
  description: string;
  needToken: number;
  tapAlgorithm: string;
  winnerLimit: string;
  winnerAddresses: string[];
  activeDate: string;
  image: string;
}

export interface AchievementSelectedRef {
  campaignId: Types.ObjectId;
  _id: Types.ObjectId;
  achievementId: Types.ObjectId;
  name: string;
  userId: Types.ObjectId;
  inviteLink: string;
  parentId: Types.ObjectId;
  addedDate: number;
}

export interface CartItem {
  langId: string;
  productId: string;
  cartItemId?: string;
  multiValuesId: string[];
  superValuesId?: string[];
  count: number;
}

export interface CustomerSyncModel {
  userId: string;
  password: string;
  birthDate: string;
  gender: string;
  email: string;
  name: string;
  familyName: string;
  phoneNumber: string;
}

export interface CheckoutDto {
  addressId: string;
  deliveryPathId: string;
  couponCode?: string;
  deliveryDate: string;
  deliveryTimeRange: string;
  langId: string;
  paymentId: string;
  useCredit: boolean;
  isMerge: boolean;
  description?: string;
  stateId: string;
  daystart: number;
  refrence: string;
  userId: string;
}

export interface ProductBase {
  Id: string;
  MaxCountInCart: number;
  Sort: number;
  ReleaseDaysCount: number;
  HourOfRelease: number;
  MinuteOfRelease: number;
  JustInCart: boolean;
  Title: string;
  RoleTitle?: string;
  EnTitle?: string;
  Slogan: string;
  InternationalCodeValue: string;
  Description: string;
  EnDescription?: string;
  AdditionalDescription: string;
  AdditionalValue: string;
  TitleParameter?: string;
  ImagesIds: string;
  Quantity: number;
  IsLastQuantity: boolean;
  UserName: string;
}

export interface Product {
  Base: ProductBase;
  CurrentValues?: string[];
  CurrentSuperValues?: string[] | null;
  ValuePriceStorages?: string[] | null;
  IsAvailable: boolean;
  Catalogs?: string[] | null;
  CatalogsString?: string;
  Tags?: string[] | null;
  TagsString?: string;
  SpecsAndValue?: string[] | null;
  SuperSpecsAndSelectedValues?: string[] | null;
  MVSpecsAndSelectedValues?: string[] | null;
  MVSpecsAndSelectedValuesStorage?: string[] | null;
  ProductSCMVCTemp?: string[] | null;
  Language?: string | null;
  LargeImage?: string | null;
  MediumImage?: string | null;
  SmallImage?: string | null;

  // Add the Price and MonthlyPrice properties here:
  Price?: string;
  MonthlyPrice?: string;
}
