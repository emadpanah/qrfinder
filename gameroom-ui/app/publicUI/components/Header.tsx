'use client';

import { FaSun, FaMoon } from 'react-icons/fa';

import GameLogo from '@/app/ui/game-logo';
import { useEffect, useState } from 'react';
import {
  registerUser,
  fetchCurrency,
  createBalance,
  //fetchTonBalance,
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
import loadTelegramScript from '@/app/utils/loadTelegramScript';
//import { useSearchParams } from 'next/navigation';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
  const [theme, setTheme] = useState<string>('light');
  const { setUserId, setAccountData, userId } = useUser();
  const [network, setNetwork] = useState<string>('N/A');
  //const searchParams = useSearchParams();

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleConnect = async () => {
      let telegramID = '';
      let telegramFN = '';
      let telegramLN = '';
      let telegramUN = '';
      let telegramLC = '';
  
      try {
        // Load the Telegram script and wait for it to resolve
        await loadTelegramScript();
  
        // Check if the Telegram WebApp object is available
        if (window.Telegram) {
          window.Telegram.WebApp.ready(); // Ensure WebApp is ready
          const user = window.Telegram.WebApp.initDataUnsafe?.user;
  
          // Fetch Telegram ID or set fallback
          if (user) {
            telegramID = user.id.toString();
            telegramFN = user.first_name!;
            telegramLN = user.last_name!;
            telegramUN = user.username!;
            telegramLC = user.language_code!;
            console.log('Telegram ID (inside then):', telegramID);
            console.log('Telegram telegramFN (inside then):', telegramFN);
            console.log('Telegram telegramLN (inside then):', telegramLN);
            console.log('Telegram telegramUN (inside then):', telegramUN);

          } else {
            telegramID = 'emad1';
            console.log('Fallback Telegram ID:', telegramID);
          }
        } else {
          console.error('Telegram WebApp is not available');
          return;
        }
  
        // Proceed only after you have the telegramID
        console.log('Telegram ID:', telegramID);
        // const chatId = searchParams.get('chatId');
        // console.log('chatId:', chatId);
  
        // Register the user with the telegramID
        const { authToken, isNewToken, userId } = await registerUser(telegramID, telegramUN,
          telegramFN, telegramLN, telegramLC);
        console.log('Server response:', { authToken, isNewToken, userId });
  
        // Fetch default currency
        const defaultCurr = await fetchDefaultCurrency();
        console.log('defaultCurr :', defaultCurr._id);
  
        // Fetch user balance
        const gbalance = await fetchBalance(userId, defaultCurr._id);
        console.log('gbalance :', gbalance);
  
        // Register shop user and update context
        setUserId(userId); // Set user ID in context
        setAccountData({
          gbalance: gbalance,
        });
  
        // Prepare customer data
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
  
        // Create customer and log success
      await createCustomerSync(customerData);


  
      } catch (error) {
        console.error('Error during registration:', error);
      }
    };
  
    handleConnect(); // Call the async function
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
