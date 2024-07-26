import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AccountType } from '@/app/lib/definitions';

interface UserContextProps {
  userId: string | null;
  setUserId: (id: string | null) => void;
  accountData: AccountType;
  setAccountData: (data: AccountType) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountType>({
    address: null,
    balance: null,
    chainId: null,
    network: null,
  });

  return (
    <UserContext.Provider value={{ userId, setUserId, accountData, setAccountData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
