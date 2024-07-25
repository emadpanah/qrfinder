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
  _id: string;
  name: string;
  description: string;
  reward: {
    tokens: number;
    products: string[];
  };
  expirationDate: Date;
  type: 'ordered' | 'unordered';
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
