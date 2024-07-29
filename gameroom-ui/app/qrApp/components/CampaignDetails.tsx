// app/qrApp/components/CampaignDetails.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Campaign, AchievementSelectedFull, Achievement } from '@/app/lib/definitions';
import { fetchCampaignById, fetchAchievementsByCampaignId, selectAchievement, unselectAchievement } from '@/app/lib/api';
import styles from '../css/qrApp.module.css';
import AchievementButton from './AchievementButton';
import { useUser } from '@/app/contexts/UserContext';
import { splitDescription } from '../../lib/utils';
import { useSwipeable } from 'react-swipeable';

interface CampaignDetailsProps {
  campaignId: string;
  onAchievementClick: (achievement: Achievement) => void; // Make this prop optional
}

const calculateRemainingDays = (expirationDate: Date) => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = Math.abs(expiration.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId, onAchievementClick }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { userId } = useUser();
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [links, setLinks] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const campaignResponse = await fetchCampaignById(campaignId);
        setCampaign(campaignResponse);

        const achievementsResponse = await fetchAchievementsByCampaignId(campaignId);
        setAchievements(achievementsResponse);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
      }
    };

    fetchCampaignDetails();
  }, [campaignId]);


  const handleSelectAchievement = useCallback(async (achievementId: string) => {
    try {
      const selected = await selectAchievement(achievementId, userId!);
      setSelectedAchievements((prev) => new Set(prev).add(achievementId));
      setLinks((prev) => ({ ...prev, [achievementId]: selected.inviteLink }));
      alert('Achievement selected successfully!');
    } catch (error) {
      console.error('Error selecting achievement:', error);
      alert('Failed to select achievement.');
    }
  }, [userId]);

  const handleUnselectAchievement = useCallback(async (achievementId: string) => {
    try {
      await unselectAchievement(achievementId, userId!);
      setSelectedAchievements((prev) => {
        const updated = new Set(prev);
        updated.delete(achievementId);
        return updated;
      });
      setLinks((prev) => {
        const { [achievementId]: _, ...rest } = prev;
        return rest;
      });
      alert('Achievement unselected successfully!');
    } catch (error) {
      console.error('Error unselecting achievement:', error);
      alert('Failed to unselect achievement.');
    }
  }, [userId]);

  const handleSwipe = (direction: string) => {
    if (direction === 'left') {
      setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, achievements.length - 1));
    } else if (direction === 'right') {
      setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    trackTouch: true,
    trackMouse: true,
  });

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
        <h2 className="text-small font-semibold pt-3 text-center">Achievements to earn</h2>
        <div className="container mx-auto p-6">
          <div className={styles.achievementList}>
            {achievements.length > 0 && (
              <div {...handlers} className={styles.achievementCarousel}>
                <AchievementButton
                  key={achievements[currentIndex]._id}
                  name={achievements[currentIndex].name}
                  reward={`${achievements[currentIndex].reward.tokens} tokens`}
                  remainingDays={calculateRemainingDays(achievements[currentIndex].expirationDate)}
                  onSelect={() => handleSelectAchievement(achievements[currentIndex]._id)}
                  onUnselect={() => handleUnselectAchievement(achievements[currentIndex]._id)}
                  isSelected={selectedAchievements.has(achievements[currentIndex]._id)}
                  link={links[achievements[currentIndex]._id] || ''}
                  handleQRClick={() => onAchievementClick(achievements[currentIndex])} 
                />
              </div>
            )}
          </div>
        </div>
      </>
    </div>
  );
};

export default CampaignDetails;
