// app/publicUI/components/Header.tsx

import { FaSun, FaMoon } from 'react-icons/fa';
import GameLogo from '@/app/ui/game-logo';

interface HeaderProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
  return (
    <div className={`px-6 md:px-12 sm:px-2 bg-yellow-500 text-white p-4 text-center ${currentTheme} `}>
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center gap-2">
          <GameLogo />
        </div>
        <div className="flex gap-8 items-center">
          <button onClick={toggleTheme} className="focus:outline-none">
            {currentTheme === 'dark' ? <FaSun className="text-white" /> : <FaMoon className="text-black" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;


  