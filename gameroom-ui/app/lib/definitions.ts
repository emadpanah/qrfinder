// app/lib/definitions.ts
export interface Campaign {
  _id: string;
  name: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  // Add other properties if needed
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
  expirationDate: Date;
  startDate: Date;
  enable: boolean;
  addedDate: Date;
  qrOrderType: 'ordered' | 'unordered';
  achievementType: 'qrcode' | 'taptoken' | 'bet' | 'dailyvisit' | 'vote' | 'inviteuser';
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
  order:number;
}



export interface AchievementSelectedFull {
  _id: string;
  achievementId: string;
  name: string;
  reward: {
    tokens: number;
    products: string[];
  };
  expirationDate: Date;
  userId: string;
  inviteLink: string;
  parentId: string; 
  addedDate: Date;  
  description: string;
  qrOrderType: string;
  achievementType: string;
  qrProofByLocation: boolean;
  campaignId: string;
  qrTarget: number;
  startDate:Date;
}

export interface Balance {
  userId: string;
  transactionType: string;
  amount: number;
  currency: string;
  transactionEntityId: string;
  timestamp: Date;
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
  address: string | null;
  balance: string | null;
  chainId: string | null;
  network: string | null;
  gbalance:string | null;
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
