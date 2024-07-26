import React, { useEffect, useState } from 'react';
import { Campaign, Achievement } from '@/app/lib/definitions';
import { fetchCampaignById, fetchAchievementsByCampaignId } from '@/app/lib/api';
import styles from '../css/qrApp.module.css';
import AchievementComponent from './Achievements';
import { useUser } from '@/app/contexts/UserContext';
import {splitDescription} from "../../lib/utils"

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

  if (!campaign) {
    return <p>Loading campaign details...</p>;
  }

  const [line1, line2] = splitDescription(campaign.description, 35);

  return (
    <div className={`container mx-auto p-6 ${styles.campaignDetailsContainer}`}>
      <>
        <h1 className="text-3xl font-bold mb-4 text-center">{campaign.name}</h1>
        <p className="mb-4 text-center">
          {line1}<br />{line2}
        </p>
        {campaign.videoUrl && (
          <div className="video-wrapper">
            <video src={campaign.videoUrl} controls className={styles.videoLarge} />
          </div>
        )}
        <h2 className="text-2xl font-semibold mb-4 pt-3 text-center">Achievements to earn</h2>
        {userId && <AchievementComponent achievements={achievements} userId={userId} />}
      </>
    </div>
  );
};

export default CampaignDetails;
