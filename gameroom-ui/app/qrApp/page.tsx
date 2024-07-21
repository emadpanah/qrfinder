// app/qrApp/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CampaignHeader from './components/CampaignHeader';
import CampaignButton from './components/CampaignButton';
import MyAchievements from './components/MyAchievements';
import CampaignDetails from './components/CampaignDetails';
import { AccountType, Campaign } from '@/app/lib/definitions';
import { fetchActiveCampaigns, fetchCampaignById } from '@/app/lib/api';
import styles from './css/qrApp.module.css';

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
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const getCampaigns = async () => {
      try {
        const campaignsData = await fetchActiveCampaigns();
        console.log("Fetched campaigns data:", campaignsData);

        campaignsData.forEach((campaign: Campaign) => {
          console.log(`Campaign ID: ${campaign.Id}, Name: ${campaign.name}`);
        });
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    getCampaigns();
  }, []);

  const handleCampaignClick = async (campaignId: string) => {
    try {
      console.log(`Campaign clicked: ${campaignId}`);
      const campaign = await fetchCampaignById(campaignId);
      console.log(`Fetched campaign: ${campaign.name}`);
      setSelectedCampaignId(campaignId);
      setSelectedCampaign(campaign);
      setActiveSection(ActiveSection.CampaignDetails);
      console.log(`Active section set to CampaignDetails with ID: ${campaignId}`);
    } catch (error) {
      console.error(`Error fetching campaign details for ID ${campaignId}:`, error);
    }
  };

  const renderActiveSection = () => {
    console.log(`Rendering section: ${activeSection}`);
    switch (activeSection) {
      case ActiveSection.Campaigns:
        return (
          <div className={`${styles.container} ${styles.spaceY4} pt-4 md:pt-8 lg:pt-12`}>
            {campaigns.map((campaign) => (
              <CampaignButton
                key={campaign.Id}
                campaign={campaign}
                onClick={handleCampaignClick}
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
    <div className={`h-full flex flex-col before:from-white after:from-sky-200 py-2`}>
      <CampaignHeader {...accountData} />
      <div className="flex flex-col flex-1 justify-center items-center">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default QRAppPage;
