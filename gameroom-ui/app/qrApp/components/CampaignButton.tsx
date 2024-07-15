// app/qrApp/components/CampaignButton.tsx

import React from 'react';
import { Campaign } from '@/app/lib/definitions';
import Image from 'next/image';

interface CampaignButtonProps {
  campaign: Campaign;
  onClick: () => void;
}

const CampaignButton: React.FC<CampaignButtonProps> = ({ campaign, onClick }) => {
  const { title, description, image } = campaign;

  return (
    <button
      onClick={onClick}
      className="relative inline-flex flex-col items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-indigo-500 rounded-lg shadow-md group"
      style={{ width: '400px', height: '400px' }}
    >
      <Image src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-75 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease">
        <p className="text-lg font-bold">{title}</p>
        <p className="text-sm">{description}</p>
      </div>
    </button>
  );
};

export default CampaignButton;
