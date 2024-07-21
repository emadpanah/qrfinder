// app/qrApp/components/CampaignDetails.tsx

import React, { useEffect, useState } from 'react';
import { Campaign, Achievement } from '@/app/lib/definitions';
import { fetchCampaignById, fetchAchievementsByCampaignId } from '@/app/lib/api';

interface CampaignDetailsProps {
  campaignId: string;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

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
    <div className="container mx-auto p-6">
      {campaign ? (
        <>
          <h1 className="text-3xl font-bold mb-4">{campaign.name}</h1>
          <p className="mb-4">{campaign.description}</p>
          {campaign.videoUrl && <video src={campaign.videoUrl} controls className="w-full h-auto mt-2" />}
          {campaign.imageUrl && <img src={campaign.imageUrl} alt="Campaign" className="w-full h-auto mt-2" />}
          <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
          <ul className="list-disc pl-6">
            {achievements.map((achievement) => (
              <li key={achievement.Id}>
                <h3 className="text-xl font-semibold">{achievement.name}</h3>
                <p>{achievement.description}</p>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-2">
                  Join Achievement
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading campaign details...</p>
      )}
    </div>
  );
};

export default CampaignDetails;
