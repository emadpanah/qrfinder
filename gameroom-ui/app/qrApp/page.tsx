// app/qrApp/page.tsx
'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CampaignHeader from './components/CampaignHeader';
import CampaignButton from './components/CampaignButton';
import MyAchievements from './components/MyAchievements';
import CampaignDetails from './components/CampaignDetails';
import AchievementDetails from './components/AchievementDetails';
import QRAchievement from './components/QRAchievement';
import { AccountType, Campaign, AchievementSelectedFull, Achievement } from '@/app/lib/definitions';
import { fetchActiveCampaigns, fetchAchievementSelectFullByUA, fetchCampaignById, fetchAchievementById, selectAchievement, createQrScan } from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import styles from './css/qrApp.module.css';
import CampaignInsert from './components/CampaignInsert';

enum ActiveSection {
  Campaigns,
  AchievementDetails,
  CampaignDetails,
  InsertCampaign
}

const QRAppPageContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>(ActiveSection.Campaigns);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedAchievementFull, setSelectedAchievementFull] = useState<AchievementSelectedFull | null>(null);

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
    const hasValidParamsQr = !!achievementId && isQrCodeType;
    const isAchieventInviteType = type === 'a';
    const hasValidparaInvi = !!achievementId && isAchieventInviteType;
    if (hasValidParamsQr) {
      if (accountData.address && userId && parentId) {
        console.log("User connected with address:", accountData.address);
        selectAchievement(achievementId!, userId, "0").then((achievement) => {
          setSelectedAchievementFull(achievement);
          fetchAchievementById(achievement.achievementId).then((ach) => {
            setSelectedAchievement(ach);
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
    if (hasValidparaInvi) {
      alert("hasValidparaInvi address :"+ accountData.address+" userId : "+ userId);
      if (accountData.address && userId) {
        console.log("User connected with address:", accountData.address);
        selectAchievement(achievementId!, userId, parentId ? parentId : '0').then((select) => {
          setSelectedAchievementFull(select);
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

  const handleAchievementClick = (achievementId: string) => {
    fetchAchievementById(achievementId).then((achievement) => {
      setSelectedAchievement(achievement);
      setActiveSection(ActiveSection.AchievementDetails);
    });
  };

  const handleMyAchievementClick = (achievementId: string) => {
    fetchAchievementById(achievementId).then((achievement) => {
      setSelectedAchievement(achievement);
      fetchAchievementSelectFullByUA(achievement._id, userId!).then((select) => {
        setSelectedAchievementFull(select);
        setActiveSection(ActiveSection.AchievementDetails);
      });
    }).catch((error) => {
      console.error('Error fetching achievement:', error);
    });
  };

  const handleBackButtonClick = () => {
    if (activeSection === ActiveSection.CampaignDetails || activeSection === ActiveSection.AchievementDetails) {
      setActiveSection(ActiveSection.Campaigns);
    } else {
      setActiveSection(ActiveSection.Campaigns);
    }
  };
  const handleInsertCampaignClick = () => {
    setActiveSection(ActiveSection.InsertCampaign);
  };

  const renderActiveSection = () => {
    console.log(`Rendering section: ${activeSection}`);
    switch (activeSection) {
      case ActiveSection.Campaigns:
        return (
          <div className={styles.campaignListContainer}>
             <div className="flex justify-between items-center w-full">
              <p className="text-s pt-4 pb-2">New Campaigns</p>
              <div className="flex justify-end ">
                <button
                  className="bg-green-500 text-xl text-white px-2 pb-1 rounded"
                  onClick={handleInsertCampaignClick}
                >
                  +
                </button>
              </div>
            </div>
            <div className={`${styles.container} ${styles.spaceY4} pt-2 md:pt-4 lg:pt-8 ${styles.campaignList}`}>
              {campaigns.map((campaign) => (
                <CampaignButton
                  key={campaign._id}
                  campaign={campaign}
                  onClick={handleCampaignClick}
                />
              ))}
            </div>
            <MyAchievements onAchievementClick={handleMyAchievementClick} />
          </div>
        );
      case ActiveSection.InsertCampaign:
      return (
        <CampaignInsert onInsertSuccess={() => setActiveSection(ActiveSection.Campaigns)} />
      );
      case ActiveSection.AchievementDetails:
        return selectedAchievement?._id ? <AchievementDetails achievement={selectedAchievement!} onBack={handleBackButtonClick} /> : null;
      case ActiveSection.CampaignDetails:
        return selectedCampaign?._id ? <CampaignDetails campaignId={selectedCampaign._id} onAchievementClick={handleAchievementClick} onBack={handleBackButtonClick} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col before:from-white after:from-sky-200 `}>
      <CampaignHeader onBack={handleBackButtonClick} />
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
