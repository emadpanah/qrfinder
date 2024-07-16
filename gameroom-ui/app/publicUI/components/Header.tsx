'use client'

import { FaSun, FaMoon } from 'react-icons/fa';
import { TonConnectButton, TonConnectUIProvider, THEME } from "@tonconnect/ui-react";
import GameLogo from '@/app/ui/game-logo';
import { useEffect, useState } from 'react';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const manifestUrl = 'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt';

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} uiPreferences={{ theme: theme === 'dark' ? THEME.DARK : THEME.LIGHT }}>
      <div className={`px-6 md:px-12 sm:px-2 bg-yellow-500 text-white p-4 text-center ${currentTheme}`}>
        <div className="flex justify-between items-center">
          <div className="flex-1 flex items-center gap-2">
            <GameLogo />
          </div>
          <div className="flex gap-8 items-center">
            <TonConnectButton />
            <button onClick={toggleTheme} className="focus:outline-none">
              {currentTheme === 'dark' ? <FaSun className="text-white" /> : <FaMoon className="text-black" />}
            </button> 
          </div>
        </div>
      </div>
    </TonConnectUIProvider>
  );
};

export default Header;
