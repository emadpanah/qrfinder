import React from 'react';
import AchievementButton from './AchievementButton';
import { Achievement } from '@/app/lib/definitions';
import { selectAchievement } from '@/app/lib/api'; // Import the API function to select an achievement
import styles from '../css/qrApp.module.css';

interface AchievementProps {
  achievements: Achievement[];
  userId: string; // New prop for user ID
}

const calculateRemainingDays = (expirationDate: Date) => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = Math.abs(expiration.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const AchievementComponent: React.FC<AchievementProps> = ({ achievements, userId }) => {
  const handleSelectAchievement = async (achievementId: string) => {
    try {
      alert(userId);
      await selectAchievement(achievementId, userId);
      alert('Achievement selected successfully!');
    } catch (error) {
      console.error('Error selecting achievement:', error);
      alert('Failed to select achievement.');
    }
  };

  return (
    <div className={styles.achievementList}>
      {achievements.map((achievement) => (
        <AchievementButton
          key={achievement.Id}
          name={achievement.name}
          reward={`${achievement.reward.tokens} tokens`} // Convert reward to string
          remainingDays={calculateRemainingDays(achievement.expirationDate)}
          onSelect={() => handleSelectAchievement(achievement.Id)} // Pass the handler
        />
      ))}
    </div>
  );
};

export default AchievementComponent;
