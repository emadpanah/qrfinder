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
  const { setUserId, setAccountData } = useUser();
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

        setUserId(userId); // Set user ID in context
        setAccountData({
          //address: '',
          //balance: '0',
          //chainId: '0', //wallet.chainId,
          //network: '',
          userId: userId,
          gbalance: gbalance,
        });
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
