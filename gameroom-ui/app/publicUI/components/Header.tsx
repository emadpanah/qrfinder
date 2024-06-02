import { AccountType } from "@/app/lib/definitions";
import GameLogo from '@/app/ui/game-logo';

interface HeaderProps extends Partial<AccountType> {}

const Header: React.FC<HeaderProps> = ({ }) => {
  return (
    <div className="px-6 md:px-12 sm:px-2 bg-gray-800 text-white p-4 text-center">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center gap-2">
        <GameLogo />
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex gap-2 item-center">
            <span className="cursor-pointer"> </span>
          </div>
        </div>
      </div>
    </div>
  );
};
  
  export default Header;
  