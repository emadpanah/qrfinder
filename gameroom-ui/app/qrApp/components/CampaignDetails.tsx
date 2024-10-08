import React, { useEffect, useState, useCallback } from 'react';
import { Campaign, Achievement, AchievementSelectedFull } from '@/app/lib/definitions';
import { fetchCampaignById, fetchAchievementsSelectedByCampaignId, fetchAchievementsByCampaignId, selectAchievement, unselectAchievement } from '@/app/lib/api';
import styles from '../css/qrApp.module.css';
import AchievementButton from './AchievementButton';
import { useUser } from '@/app/contexts/UserContext';
import { splitDescription } from '../../lib/utils';
import { useSwipeable } from 'react-swipeable';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';

interface CampaignDetailsProps {
  campaignId: string;
  onAchievementClick: (achievementId: string) => void;
  onBack: () => void;
}

const calculateRemainingDays = (expirationTimestamp: number) => {
  const todayTimestamp = Date.now(); // Current timestamp in milliseconds
  const diffTime = Math.abs(expirationTimestamp - todayTimestamp); // Difference in milliseconds
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return diffDays;
};


const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId, onAchievementClick, onBack }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { userId } = useUser();
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());
  const [links, setLinks] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [achievementsSelectedFull, setAchievementsSelectedFull] = useState<AchievementSelectedFull[]>([]);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        const campaignResponse = await fetchCampaignById(campaignId);
        setCampaign(campaignResponse);

        const achievementsResponse = await fetchAchievementsByCampaignId(campaignId);
        setAchievements(achievementsResponse);

        const selected = await fetchAchievementsSelectedByCampaignId(campaignId, userId!);
        setAchievementsSelectedFull(selected);
        //alert(selected[0]._id);

      } catch (error) {
        console.error('Error fetching campaign details:', error);
      }
    };

    fetchCampaignDetails();
  }, [campaignId, userId]);
      
      
  const handleSelectAchievement = useCallback(async (achievementId: string) => {
    try {
      const selected = await selectAchievement(achievementId, userId!, "0");
      setSelectedAchievements((prev) => new Set(prev).add(achievementId));
      setLinks((prev) => ({ ...prev, [achievementId]: selected.inviteLink }));
      toast.success('Achievement selected successfully!');
      const selecteds = await fetchAchievementsSelectedByCampaignId(campaignId, userId!);
      setAchievementsSelectedFull(selecteds);
    } catch (error) {
      console.error('Error selecting achievement:', error);
      toast.error('Failed to select achievement.');
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
      toast.success('Achievement unselected successfully!');
      const selecteds = await fetchAchievementsSelectedByCampaignId(campaignId, userId!);
      setAchievementsSelectedFull(selecteds);
    } catch (error) {
      console.error('Error unselecting achievement:', error);
      toast.error('Failed to unselect achievement.');
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
                  //onSelect={achievementsSelectedFull.find(a=>a.achievementId==achievements[currentIndex]._id) ? () => null : () => handleSelectAchievement(achievements[currentIndex]._id)}
                  //onUnselect={achievementsSelectedFull.find(a=>a.achievementId==achievements[currentIndex]._id) ?  () => handleUnselectAchievement(achievements[currentIndex]._id): () => null}
                  onUnselect={() => handleUnselectAchievement(achievements[currentIndex]._id)}
                  isSelected={achievementsSelectedFull.find(a=>a.achievementId==achievements[currentIndex]._id)?true:false}
                  link={links[achievements[currentIndex]._id] || ''}
                  handleQRClick={() => onAchievementClick(achievements[currentIndex]._id)}
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
