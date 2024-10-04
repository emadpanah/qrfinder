'use client';

import { FaSun, FaMoon } from 'react-icons/fa';

import GameLogo from '@/app/ui/game-logo';
import { useEffect, useState } from 'react';
import {
  registerUser,
  fetchCurrency,
  createBalance,
  fetchTonBalance,
  fetchBalance,
  fetchDefaultCurrency,
  createCustomerSync,
  getAllProducts,
} from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import { Balance } from '@/app/lib/definitions';
import { types } from 'util';
import { Types } from 'mongoose';
import { Transaction } from 'ethers';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
  const [theme, setTheme] = useState<string>('light');
  const { setUserId, setAccountData, userId } = useUser();
  const [network, setNetwork] = useState<string>('N/A');

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleConnect = async () => {
      try {
        const telegramID =
          window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'emad1';

        console.log('Telegram ID:', telegramID);

        const { authToken, isNewToken, userId } =
          await registerUser(telegramID);
        console.log('Server response:', { authToken, isNewToken, userId });
        const defaultCurr = await fetchDefaultCurrency();
        console.log('defaultCurr :', defaultCurr._id);
        const gbalance = await fetchBalance(userId, defaultCurr._id);
        console.log('gbalance :', gbalance);
        //register shop user
        setUserId(userId); // Set user ID in context
        setAccountData({
          //address: '',
          //balance: '0',
          //chainId: '0', //wallet.chainId,
          //network: '',
          gbalance: gbalance,
        });

        const customerData = {
          name: '-',
          familyName: '-',
          phoneNumber: telegramID,
          password: '-',
          email: '-',
          gender: 2,
          birthDate: '-',
          userId: userId,
        };

        // Create customer and fetch the token from response
        const customerSyncResponse = await createCustomerSync(customerData);
        const tokenShop = customerSyncResponse.token; // Token from response

        console.log('Customer created successfully:', customerSyncResponse);

        // Now fetch all products using the received token
        const products = await getAllProducts(tokenShop);
        console.log('Products fetched:', products);
      } catch (error) {
        console.error('Error during registration:', error);
      }
    };

    handleConnect();
  }, [setUserId, setAccountData]);

  return (
    <header
      className={`px-2 pb-1 pt-1 sm:px-2 md:px-12 ${theme === 'dark' ? 'text-black bg-[#bb86fc]' : 'bg-[#6200ea] text-white'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <GameLogo />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="focus:outline-none">
            {theme === 'dark' ? (
              <FaSun className="text-white" />
            ) : (
              <FaMoon className="text-black" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
