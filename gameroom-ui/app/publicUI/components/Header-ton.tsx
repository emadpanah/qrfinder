'use client';

import { FaSun, FaMoon } from 'react-icons/fa';
import {
  TonConnectButton,
  TonConnectUIProvider,
  THEME,
  useTonAddress,
  useTonWallet,
} from '@tonconnect/ui-react';
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

const manifestUrl =
  'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
  const [theme, setTheme] = useState<string>('light');
  const tonAddress = useTonAddress();
  const wallet = useTonWallet();
  const { setUserId, setAccountData } = useUser();
  const [network, setNetwork] = useState<string>('N/A');

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleConnect = async () => {
      if (wallet) {
        try {
          const telegramID =
            window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown';

          console.log('Wallet connected:', wallet);
          console.log('Address:', tonAddress);
          console.log('Telegram ID:', telegramID);

          // const { authToken, isNewToken, userId } = await registerUser({
          //   address: tonAddress,
          //   telegramID,
          //   walletType: wallet.device.appName,
          // });
          // console.log('Server response:', { authToken, isNewToken, userId });

          const defaultCurr = await fetchDefaultCurrency();
          console.log('defaultCurr :', defaultCurr._id);
          // const gbalance = await fetchBalance(userId, defaultCurr._id);
          // console.log('gbalance :', gbalance);

          const tonBalance = Number.parseInt(
            await fetchTonBalance(tonAddress, 'mainnet'),
          );

          //create Ton balance in DB comment for now
          //  const toncur =  await fetchCurrency("TON");
          //  const tonpastbalance =  await fetchBalance(userId, defaultCurr._id);
          // if(tonBalance != tonpastbalance)
          // {
          //   createBalance(userId, "walletsync", tonBalance, toncur._id,
          //      tonAddress, tonBalance);
          // }

          // setUserId(userId); // Set user ID in context
          // setAccountData({
          //   address: tonAddress,
          //   balance: tonBalance.toString(),
          //   chainId: '0', //wallet.chainId,
          //   network: wallet.device.appName,
          //   gbalance: gbalance,
          // });

          // let balance;
          // if (wallet.network === 'mainnet') {
          //   balance = await fetchBalance(tonAddress, 'mainnet');
          //   setNetwork('Mainnet');
          // } else if (wallet.network === 'testnet') {
          //   balance = await fetchBalance(tonAddress, 'testnet');
          //   setNetwork('Testnet');
          // } else {
          //   balance = '0';
          //   setNetwork('Unknown');
          // }
          // console.log("Balance fetched:", balance);

          // setUserId(userId); // Set user ID in context
          // setAccountData({
          //   address: tonAddress,
          //   balance: balance,
          //   chainId: null, // Remove or set null if chainId is not available
          //   network: network,
          // });
        } catch (error) {
          console.error('Error during registration:', error);
        }
      }
    };

    if (wallet) {
      handleConnect();
    }
  }, [wallet, tonAddress, setUserId, setAccountData]);

  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: theme === 'dark' ? THEME.DARK : THEME.LIGHT }}
    >
      <header
        className={`px-2 pb-1 pt-1 sm:px-2 md:px-12 ${theme === 'dark' ? 'text-black bg-[#bb86fc]' : 'bg-[#6200ea] text-white'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <GameLogo />
          </div>
          <div className="flex items-center gap-2">
            <TonConnectButton />
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
    </TonConnectUIProvider>
  );
};

export default Header;
