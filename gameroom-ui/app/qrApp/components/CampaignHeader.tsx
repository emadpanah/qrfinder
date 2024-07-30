import React from 'react';
import { AccountType } from '@/app/lib/definitions';
import { useUser } from '@/app/contexts/UserContext';

const CampaignHeader: React.FC = () => {
  const { accountData } = useUser();

  return (
    <div className="px-6 md:px-12 sm:px-2 bg-yellow-500 text-white p-4 text-center">
      <div className="flex justify-between items-center">
        <div className="flex-1 items-center gap-2">
          {/* Display account information */}
          <span className='pr-8'>Ton Balance : {accountData.balance ?? "N/A"}<span className='text-xs'> t</span></span>
          <span>Gain Balance : {0 ?? "N/A"}<span className='text-xs'> g</span></span>
        </div>
      </div>
    </div>
  );
};

export default CampaignHeader;
