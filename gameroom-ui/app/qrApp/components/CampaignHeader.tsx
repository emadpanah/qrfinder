import React from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { FaArrowLeft } from 'react-icons/fa';

interface CampaignHeaderProps {
  onBack: () => void;
}

const CampaignHeader: React.FC<CampaignHeaderProps> = ({ onBack }) => {
  const { accountData } = useUser();

  return (
    <div className="px-6 md:px-12 sm:px-2 bg-yellow-500 text-white p-2 text-center">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-white focus:outline-none">
          <FaArrowLeft />
        </button>
        <div className="flex-1 items-center gap-2">
          {/* Display account information */}
          {/* <span className='pr-8'>Ton Balance : {accountData.balance ?? "N/A"}<span className='text-xs'> t</span></span>
          <span>Gain Balance : {accountData.gbalance ?? "N/A"}<span className='text-xs'> g</span></span> */}
        </div>
      </div>
    </div>
  );
};

export default CampaignHeader;
