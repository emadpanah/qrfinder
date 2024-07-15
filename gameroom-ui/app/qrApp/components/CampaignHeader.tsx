// app/qrApp/components/CampaignHeader.tsx
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { AccountType } from '@/app/lib/definitions';

interface CampaignHeaderProps extends AccountType {}

const CampaignHeader: React.FC<CampaignHeaderProps> = ({ address, balance, chainId, network }) => {
  return (
    <div className="px-6 md:px-12 sm:px-2 bg-yellow-500 text-white p-4 text-center">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center gap-2">
          {/* Display account information */}
          <span>Address: {address ?? "N/A"}</span>
          <span>Balance: {balance ?? "N/A"}</span>
          <span>Chain ID: {chainId ?? "N/A"}</span>
          <span>Network: {network ?? "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default CampaignHeader;
