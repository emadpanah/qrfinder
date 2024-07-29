// app/qrApp/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CampaignHeader from './components/CampaignHeader';
import CampaignButton from './components/CampaignButton';
import MyAchievements from './components/MyAchievements';
import CampaignDetails from './components/CampaignDetails';
import AchievementDetails from './components/AchievementDetails'; // Import the new component
import QRAchievement from './components/QRAchievement'; // Import the new component
import { AccountType, Campaign, AchievementSelectedFull, Achievement } from '@/app/lib/definitions';
import { fetchActiveCampaigns, fetchCampaignById, fetchAchievementById, selectAchievement, createQrScan } from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import styles from './css/qrApp.module.css';

enum ActiveSection {
  Campaigns,
  AchievementDetails,
  CampaignDetails
}

const QRAppPageContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>(ActiveSection.Campaigns);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null); // New state for selected achievement

  

  const searchParams = useSearchParams();
  const { accountData, userId } = useUser();


  useEffect(() => {
    const getCampaigns = async () => {
      try {
        const campaignsData = await fetchActiveCampaigns();
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };
    getCampaigns();
  }, []);

  useEffect(() => {
    const achievementId = searchParams.get('a');
    const type = searchParams.get('t');
    const parentId = searchParams.get('p');
    const isQrCodeType = type === 'q';
    const achievementIdExists = !!achievementId;
    const parentIdExists = !!parentId; 
    const hasValidParams = achievementIdExists && isQrCodeType;
    const isAchieventInviteType = type === 'a';
    const hasValidParams2 = achievementIdExists && isAchieventInviteType;
    if (hasValidParams) {
      console.log("qrId", parentId);
      if (accountData.address && userId && parentId) {
        console.log("User connected with address:", accountData.address);
        selectAchievement(achievementId!, userId).then(() => {
          fetchAchievementById(achievementId!).then((achievement) => {
            setSelectedAchievement(achievement);
            createQrScan(parentId.toString(), userId, 0, 0);
            setActiveSection(ActiveSection.AchievementDetails);
          }).catch((error) => {
            console.error('Error fetching achievement:', error);
          });
        }).catch((error) => {
          console.error('Error selecting achievement:', error);
        });
      } 
    }
    if (hasValidParams2) {
      console.log("parentId", parentId);
      if (accountData.address && userId) {
        console.log("User connected with address:", accountData.address);
        selectAchievement(achievementId!, userId, parentIdExists?parentId:'0').then(() => {
          fetchAchievementById(achievementId!).then((achievement) => {
            setSelectedAchievement(achievement);
            setActiveSection(ActiveSection.AchievementDetails);
          }).catch((error) => {
            console.error('Error fetching achievement:', error);
          });
        }).catch((error) => {
          console.error('Error selecting achievement:', error);
        });
      } 
    }
    // Add other conditions for t='a' if necessary
  }, [searchParams, accountData.address, userId]);

  const handleCampaignClick = async (campaignId: string) => {
    try {
      console.log(`Campaign clicked: ${campaignId}`);
      const campaign = await fetchCampaignById(campaignId);
      console.log(`Fetched campaign: ${campaign.name}`);
      setSelectedCampaign(campaign);
      setActiveSection(ActiveSection.CampaignDetails);
      console.log(`Active section set to CampaignDetails with ID: ${campaignId}`);
    } catch (error) {
      console.error(`Error fetching campaign details for ID ${campaignId}:`, error);
    }
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setActiveSection(ActiveSection.AchievementDetails);
  };

  const handleMyAchievementClick = (achievementId: string) => {
    fetchAchievementById(achievementId).then((achievement) => {
      setSelectedAchievement(achievement);
      setActiveSection(ActiveSection.AchievementDetails);
    }).catch((error) => {
      console.error('Error fetching achievement:', error);
    });
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
            <MyAchievements onAchievementClick={handleMyAchievementClick} /> {/* Include MyAchievements below the campaign list */}
          </div>
        );
      case ActiveSection.AchievementDetails:
        return selectedAchievement ? <AchievementDetails achievement={selectedAchievement} /> : null; // Render AchievementDetails with selected achievement
      case ActiveSection.CampaignDetails:
        return selectedCampaign?._id ? <CampaignDetails campaignId={selectedCampaign._id} onAchievementClick={handleAchievementClick} /> : null;
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

const QRAppPage: React.FC = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <QRAppPageContent />
  </Suspense>
);

export default QRAppPage;
