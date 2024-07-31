// app/qrApp/components/MyAchievements.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { AchievementSelectedFull } from '@/app/lib/definitions';
import { useUser } from '@/app/contexts/UserContext';
import { fetchSelectedFullAchievementsByUser, unselectAchievement } from '@/app/lib/api';
import { useSwipeable } from 'react-swipeable';
import styles from '../css/qrApp.module.css';
import AchievementButton from './AchievementButton';
import { toast } from 'react-toastify';

interface MyAchievementsProps {
  onAchievementClick: (achievementId: string) => void; // Add this prop
}

const MyAchievements: React.FC<MyAchievementsProps> = ({ onAchievementClick }) => {
  const [achievements, setAchievements] = useState<AchievementSelectedFull[]>([]);
  const { userId } = useUser(); // Use userId from UserContext
  const [currentIndex, setCurrentIndex] = useState(0);

  const calculateRemainingDays = (expirationDate: Date) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = Math.abs(expiration.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchAchievements = useCallback(async () => {
          try {
        const fetchedAchievements = await fetchSelectedFullAchievementsByUser(userId!);
        setAchievements(fetchedAchievements);
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
    <div className="container mx-auto ">
      <p className="text-small  font-semibold text-center pt-3 ">My Achievements</p>
      <div className={styles.achievementList}>
        {achievements.length > 0 && (
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
              handleQRClick={() => onAchievementClick(achievements[currentIndex].achievementId)} // Pass the click handler
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAchievements;
