'use client';

import { FaSun, FaMoon } from 'react-icons/fa';
import { TonConnectButton, TonConnectUIProvider, THEME, useTonAddress, useTonWallet } from "@tonconnect/ui-react";
import GameLogo from '@/app/ui/game-logo';
import { useEffect, useState } from 'react';
import { registerUser } from '@/app/lib/api'; // Adjust the import path as necessary

const manifestUrl = 'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
  const [theme, setTheme] = useState<string>('light');
  const tonAddress = useTonAddress();
  const wallet = useTonWallet();

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const handleConnect = async () => {
    if (wallet) {
      try {
        const telegramID = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'unknown';

        console.log("Wallet connected:", wallet);
        console.log("Address:", tonAddress);
        console.log("Telegram ID:", telegramID);

        const { authToken, isNewToken } = await registerUser({
          address: tonAddress,
          telegramID,
          walletType: wallet.device.appName,
        });

        console.log("Server response:", { authToken, isNewToken });

        // Handle any additional logic after registration
      } catch (error) {
        console.error('Error during registration:', error);
      }
    }
  };

  useEffect(() => {
    if (wallet) {
      handleConnect();
    }
  }, [wallet]);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} uiPreferences={{ theme: theme === 'dark' ? THEME.DARK : THEME.LIGHT }}>
      <header className={`px-6 md:px-12 sm:px-2 ${theme === 'dark' ? 'bg-[#bb86fc] text-black' : 'bg-[#6200ea] text-white'}`}>
        <div className="flex justify-between items-center">
          <div className="flex-1 flex items-center gap-2">
            <GameLogo />
          </div>
          <div className="flex gap-8 items-center">
            <button onClick={toggleTheme} className="focus:outline-none">
              {theme === 'dark' ? <FaSun className="text-white" /> : <FaMoon className="text-black" />}
            </button>
            <TonConnectButton />
          </div>
        </div>
      </header>
    </TonConnectUIProvider>
  );
};

export default Header;
