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
}

export interface AccountType {
  address: string | null;
  balance: string | null;
  chainId: string | null;
  network: string | null;
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
