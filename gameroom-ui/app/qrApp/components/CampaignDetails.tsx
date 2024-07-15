// app/qrApp/components/CampaignDetails.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Campaign, Achievement } from '@/app/lib/definitions';

interface CampaignDetailsProps {
  campaignId: string;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const campaignResponse = await axios.get(`/api/campaigns/${campaignId}`); // Replace with your actual API endpoint
        setCampaign(campaignResponse.data);

        const achievementsResponse = await axios.get(`/api/campaigns/${campaignId}/achievements`); // Replace with your actual API endpoint
        setAchievements(achievementsResponse.data);
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
          <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
          <ul className="list-disc pl-6">
            {achievements.map((achievement) => (
              <li key={achievement.id}>
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
