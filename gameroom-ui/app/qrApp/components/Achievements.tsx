import React, { useEffect, useState, useCallback } from 'react';
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
const [links, setLinks] = useState<Record<string, string>>({});

  const fetchSelectedAchievements = useCallback(async () => {
    try {
      const selected = await fetchSelectedAchievementsByUser(userId);
      setSelectedAchievements(new Set(selected.map((ach: any) => ach.achievementId)));
      const qrCodesMap: Record<string, string> = {};
      const linksMap: Record<string, string> = {};
      selected.forEach((ach: any) => {
        qrCodesMap[ach.achievementId] = ach.inviteQrCode;
        linksMap[ach.achievementId] = ach.inviteLink;
      });
      setLinks(linksMap);
      console.log('Fetched achievements:', { qrCodesMap, linksMap });
    } catch (error) {
      console.error('Error fetching selected achievements:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchSelectedAchievements();
  }, [fetchSelectedAchievements]);

  const handleSelectAchievement = useCallback(async (achievementId: string) => {
    try {
      const selected = await selectAchievement(achievementId, userId);
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
      await unselectAchievement(achievementId, userId);
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

  return (
    <div className={styles.achievementList}>
      {achievements.map((achievement) => {
        const link = links[achievement._id];

        return (
          <AchievementButton
            key={achievement._id}
            name={achievement.name}
            reward={`${achievement.reward.tokens} tokens`}
            remainingDays={calculateRemainingDays(achievement.expirationDate)}
            onSelect={() => handleSelectAchievement(achievement._id)}
            onUnselect={() => handleUnselectAchievement(achievement._id)}
            isSelected={selectedAchievements.has(achievement._id)}
            link={link || ''}
          />
        );
      })}
    </div>
  );
};

export default AchievementComponent;
