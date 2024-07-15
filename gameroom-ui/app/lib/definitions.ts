
// app/lib/definitions.ts
export interface Campaign {
  id: string;
  name: string; // Add name property
  title: string;
  description: string;
  image: string;
  // Add other properties if needed
}


export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: {
    tokens: number;
    products: string[];
  };
  expirationDate: Date;
  expectedLocation: {
    lat: number;
    lon: number;
    allowedRange: number;
  };
  type: 'ordered' | 'unordered';
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
  winnerLimit:string;
  winnerAddresses: string[];
  activeDate: string;
  image: string;
}