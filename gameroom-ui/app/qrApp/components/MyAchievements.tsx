import React, { useCallback, useEffect, useState } from 'react';
import { AchievementSelectedFull } from '@/app/lib/definitions';
import { useUser } from '@/app/contexts/UserContext';
import { fetchSelectedFullAchievementsByUser, unselectAchievement } from '@/app/lib/api';
import styles from '../css/qrApp.module.css';
import AchievementButton from './AchievementButton';

const MyAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementSelectedFull[]>([]);
  const { userId } = useUser(); // Use userId from UserContext

  const calculateRemainingDays = (expirationDate: Date) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = Math.abs(expiration.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    const fetchAchievements = async () => {
      if (userId) {
        try {
          const fetchedAchievements = await fetchSelectedFullAchievementsByUser(userId);
          setAchievements(fetchedAchievements);
        } catch (error) {
          console.error('Error fetching achievements:', error);
        }
      }
    };

    fetchAchievements();
  }, [userId]);

  const handleUnselectAchievement = useCallback(async (achievementId: string) => {
    if (userId) {
      try {
        await unselectAchievement(achievementId, userId);
        alert('Achievement unselected successfully!');
      } catch (error) {
        console.error('Error unselecting achievement:', error);
        alert('Failed to unselect achievement.');
      }
    }
  }, [userId]);

  return (
    <div className="container mx-auto p-6">
      <div className={styles.achievementList}>
      <h1 className="text-2xl font-bold mb-4">My Achievements</h1>
        {achievements.map((achievement) => {
          const link = achievement.inviteLink;

          return (
            <AchievementButton
              key={achievement._id}
              name={achievement.name}
              reward={`${achievement.reward.tokens} tokens`}
              remainingDays={calculateRemainingDays(achievement.expirationDate)}
              onSelect={() => null}
              onUnselect={() => handleUnselectAchievement(achievement._id)}
              isSelected={true}
              link={link || ''}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MyAchievements;
