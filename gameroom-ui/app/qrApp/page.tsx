'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignHeader from './components/CampaignHeader';
import CampaignButton from './components/CampaignButton';
import MyAchievements from './components/MyAchievements';
import CampaignDetails from './components/CampaignDetails'; // Ensure this is imported
import { AccountType, Campaign } from '@/app/lib/definitions';
import { TonConnectButton } from '@tonconnect/ui-react'
import { THEME,TonConnectUIProvider } from "@tonconnect/ui-react"

const manifestUrl = 'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt';

enum ActiveSection {
  Campaigns,
  MyAchievements,
  CampaignDetails,
}

const QRAppPage: React.FC = () => {
  const [accountData, setAccountData] = useState<AccountType>({
    address: null,
    balance: null,
    chainId: null,
    network: null,
  });
  const [activeSection, setActiveSection] = useState<ActiveSection>(ActiveSection.Campaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // Fetch campaigns data here
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/campaigns'); // Adjust the URL to your API endpoint
        setCampaigns(response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignClick = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActiveSection(ActiveSection.CampaignDetails);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case ActiveSection.Campaigns:
        return (
          <div className="grid gap-4 pt-4 md:pt-8 lg:pt-12">
            {campaigns.map((campaign) => (
              <CampaignButton
                key={campaign.id}
                campaign={campaign}
                onClick={() => handleCampaignClick(campaign.id)}
              />
            ))}
          </div>
        );
      case ActiveSection.MyAchievements:
        return <MyAchievements />;
      case ActiveSection.CampaignDetails:
        return selectedCampaignId ? <CampaignDetails campaignId={selectedCampaignId} /> : null;
      default:
        return null;
    }
  };

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} uiPreferences={{ theme: THEME.DARK }}>
      <div className={`h-full flex flex-col before:from-white after:from-sky-200 py-2`}>
        <CampaignHeader {...accountData} />
        <div className="flex flex-col flex-1 justify-center items-center">
          <TonConnectButton />
          {renderActiveSection()}
        </div>
      </div>
    </TonConnectUIProvider>
  );
};

export default QRAppPage;
