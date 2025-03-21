import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AccountType } from '@/app/lib/definitions';
import { fetchDefaultCurrency, fetchBalance } from '../lib/api';

interface UserContextProps {
  userId: string | null;
  setUserId: (id: string | null) => void;
  accountData: AccountType;
  setAccountData: (data: AccountType) => void;
  updateBalance: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountType>({
    //address: null,
    //balance: null,
    //chainId: null,
    //network: null,
    //userId: null,
    gbalance: 0,
    
  });

  const updateBalance = async () => {
    if (userId) {
      const defaultCurr = await fetchDefaultCurrency();
      const gbalance = await fetchBalance(userId, defaultCurr._id);
      console.log("gbalance -- ",gbalance);
      setAccountData((prevState) => ({
        ...prevState,
        gbalance: gbalance,
      }));
    }
  };

  return (
    <UserContext.Provider
      value={{ userId, setUserId, accountData, setAccountData, updateBalance }}
    >
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
