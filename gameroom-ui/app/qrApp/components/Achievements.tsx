import React, { useEffect, useState } from 'react';
import AchievementButton from './AchievementButton';
import { Achievement } from '@/app/lib/definitions';
import { fetchSelectedAchievementsByUser, selectAchievement, unselectAchievement } from '@/app/lib/api'; // Import the API functions
import styles from '../css/qrApp.module.css';

interface AchievementProps {
  achievements: Achievement[];
  userId: string;
}

const calculateRemainingDays = (expirationDate: Date) => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = Math.abs(expiration.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const AchievementComponent: React.FC<AchievementProps> = ({ achievements, userId }) => {
  const [selectedAchievements, setSelectedAchievements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSelectedAchievements = async () => {
      try {
        const selected = await fetchSelectedAchievementsByUser(userId);
        setSelectedAchievements(new Set(selected.map((ach: any) => ach.achievementId)));
      } catch (error) {
        console.error('Error fetching selected achievements:', error);
      }
    };

    fetchSelectedAchievements();
  }, [userId]);

  const handleSelectAchievement = async (achievementId: string) => {
    try {
      await selectAchievement(achievementId, userId);
      setSelectedAchievements((prev) => new Set(prev).add(achievementId));
      alert('Achievement selected successfully!');
    } catch (error) {
      console.error('Error selecting achievement:', error);
      alert('Failed to select achievement.');
    }
  };

  const handleUnselectAchievement = async (achievementId: string) => {
    try {
      await unselectAchievement(achievementId, userId);
      setSelectedAchievements((prev) => {
        const updated = new Set(prev);
        updated.delete(achievementId);
        return updated;
      });
      alert('Achievement unselected successfully!');
    } catch (error) {
      console.error('Error unselecting achievement:', error);
      alert('Failed to unselect achievement.');
    }
  };

  return (
    <div className={styles.achievementList}>
      {achievements.map((achievement) => (
        <AchievementButton
          key={achievement.Id}
          name={achievement.name}
          reward={`${achievement.reward.tokens} tokens`}
          remainingDays={calculateRemainingDays(achievement.expirationDate)}
          onSelect={() => handleSelectAchievement(achievement.Id)}
          onUnselect={() => handleUnselectAchievement(achievement.Id)} // Pass the unselect handler
          isSelected={selectedAchievements.has(achievement.Id)} // Pass the selected status
        />
      ))}
    </div>
  );
};

export default AchievementComponent;
