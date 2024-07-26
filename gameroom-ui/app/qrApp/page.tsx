// app/qrApp/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CampaignHeader from './components/CampaignHeader';
import CampaignButton from './components/CampaignButton';
import MyAchievements from './components/MyAchievements';
import CampaignDetails from './components/CampaignDetails';
import AchievementDetails from './components/AchievementDetails'; // Import the new component
import { AccountType, Campaign, AchievementSelectedFull } from '@/app/lib/definitions';
import { fetchActiveCampaigns, fetchCampaignById } from '@/app/lib/api';
import styles from './css/qrApp.module.css';

enum ActiveSection {
  Campaigns,
  AchievementDetails,
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
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementSelectedFull | null>(null); // New state for selected achievement

  useEffect(() => {
    const getCampaigns = async () => {
      try {
        const campaignsData = await fetchActiveCampaigns();
        console.log("Fetched campaigns data:", campaignsData);

        campaignsData.forEach((campaign: Campaign) => {
          console.log(`Campaign ID: ${campaign._id}, Name: ${campaign.name}`);
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

  const handleAchievementClick = (achievement: AchievementSelectedFull) => {
    setSelectedAchievement(achievement);
    setActiveSection(ActiveSection.AchievementDetails);
  };

  const renderActiveSection = () => {
    console.log(`Rendering section: ${activeSection}`);
    switch (activeSection) {
      case ActiveSection.Campaigns:
        return (
          <div className={styles.campaignListContainer}>
            <p className="text-small text-center pt-4 pb-2 ">New Campaigns</p>
            <div className={`${styles.container} ${styles.spaceY4} pt-2 md:pt-4 lg:pt-8 ${styles.campaignList}`}>
              {campaigns.map((campaign) => (
                <CampaignButton
                  key={campaign._id}
                  campaign={campaign}
                  onClick={handleCampaignClick}
                />
              ))}
            </div>
            <MyAchievements onAchievementClick={handleAchievementClick} /> {/* Include MyAchievements below the campaign list */}
          </div>
        );
      case ActiveSection.AchievementDetails:
        return selectedAchievement ? <AchievementDetails achievement={selectedAchievement} /> : null; // Render AchievementDetails with selected achievement
      case ActiveSection.CampaignDetails:
        return selectedCampaignId ? <CampaignDetails campaignId={selectedCampaignId} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col before:from-white after:from-sky-200 py-2`}>
      <CampaignHeader />
      <div className="flex flex-col flex-1 justify-center items-center">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default QRAppPage;
