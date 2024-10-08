import React, { useCallback, useEffect, useState, useRef } from 'react';
import { AchievementSelectedFull } from '@/app/lib/definitions';
import { useUser } from '@/app/contexts/UserContext';
import { fetchSelectedFullAchievementsByUser, unselectAchievement } from '@/app/lib/api';
import { useSwipeable } from 'react-swipeable';
import styles from '../css/qrApp.module.css';
import AchievementButton from './AchievementButton';
import { toast } from 'react-toastify';

interface MyAchievementsProps {
  onAchievementClick: (achievementId: string) => void;
}

const MyAchievements: React.FC<MyAchievementsProps> = ({ onAchievementClick }) => {
  const [achievements, setAchievements] = useState<AchievementSelectedFull[]>([]);
  const { userId } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);

  const calculateRemainingDays = (expirationTimestamp: number) => {
    const todayTimestamp = Date.now(); // Current time in milliseconds (timestamp)
    const diffTime = Math.abs(expirationTimestamp - todayTimestamp); // Difference in milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays;
  };
  

  const fetchAchievements = useCallback(async () => {
    try {
      if(userId) {
        const fetchedAchievements = await fetchSelectedFullAchievementsByUser(userId);
        setAchievements(fetchedAchievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const handleUnselectAchievement = useCallback(async (achievementId: string) => {
    if (userId) {
      try {
        const response = await unselectAchievement(achievementId, userId);
        if (response.success) {
          toast.success(response.message);
          fetchAchievements();
          setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        } else {
          toast.error('Failed to unselect achievement.');
        }
      } catch (error) {
        console.error('Error unselecting achievement:', error);
        toast.error('Failed to unselect achievement.');
      }
    }
  }, [userId, fetchAchievements]);

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

  return (
    <div className="container mx-auto pb-3">
      <p className="text-small font-semibold text-center pt-3">My Achievements</p>
      <div className={styles.achievementList}>
        {achievements.length > 0 ? (
          <div {...handlers} className={styles.achievementCarousel}>
            <AchievementButton
              key={achievements[currentIndex]._id}
              name={achievements[currentIndex].name}
              reward={`${achievements[currentIndex].reward.tokens} tokens`}
              remainingDays={calculateRemainingDays(achievements[currentIndex].expirationDate)}
              onSelect={() => null}
              onUnselect={() => handleUnselectAchievement(achievements[currentIndex].achievementId)}
              isSelected={true}
              link={achievements[currentIndex].inviteLink || ''}
              handleQRClick={() => onAchievementClick(achievements[currentIndex].achievementId)}
            />
          </div>
        ) : (
          <p className="text-center">No achievements found.</p>
        )}
      </div>
    </div>
  );
};

export default MyAchievements;
