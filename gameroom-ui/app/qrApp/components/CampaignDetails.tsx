// app/qrApp/components/CampaignDetails.tsx
import React, { useEffect, useState } from 'react';
import { Campaign, Achievement } from '@/app/lib/definitions';
import { fetchCampaignById, fetchAchievementsByCampaignId } from '@/app/lib/api';
import styles from '../css/qrApp.module.css';
import AchievementComponent from './Achievements';
import { useUser } from '@/app/contexts/UserContext';

interface CampaignDetailsProps {
  campaignId: string;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { userId } = useUser();

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        console.log(`Fetching details for campaign ID: ${campaignId}`);
        const campaignResponse = await fetchCampaignById(campaignId);
        setCampaign(campaignResponse);
        console.log(`Fetched campaign details: ${campaignResponse.name}`);

        const achievementsResponse = await fetchAchievementsByCampaignId(campaignId);
        setAchievements(achievementsResponse);
        console.log(`Fetched achievements for campaign: ${campaignResponse.name}`);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
      }
    };

    fetchCampaignDetails();
  }, [campaignId]);

  return (
    <div className={`container mx-auto p-6 ${styles.campaignDetailsContainer}`}>
      {campaign ? (
        <>
          <h1 className="text-3xl font-bold mb-4">{campaign.name}</h1>
          <p className="mb-4">{campaign.description}</p>
          {campaign.videoUrl && <video src={campaign.videoUrl} controls className={styles.videoLarge} />}
          <h2 className="text-2xl font-semibold mb-4 pt-3">Achievements to earn</h2>
          {userId && <AchievementComponent achievements={achievements} userId={userId} />}
        </>
      ) : (
        <p>Loading campaign details...</p>
      )}
    </div>
  );
};

export default CampaignDetails;
