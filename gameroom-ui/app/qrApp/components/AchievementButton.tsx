import React from 'react';
import styles from '../css/qrApp.module.css';

interface AchievementButtonProps {
  name: string;
  reward: string;
  remainingDays: number;
  onSelect: () => void;
  onUnselect: () => void; // Add this prop for the button click handler
  isSelected: boolean;
}

const AchievementButton: React.FC<AchievementButtonProps> = ({ name, reward, remainingDays, onSelect, onUnselect, isSelected }) => {
  return (
    <div className={styles.achievementButton}>
      <div className={styles.achievementText}>
        <h3>{name}</h3>
        <p>Reward: {reward}</p>
        <p>{remainingDays} days left</p>
      </div>
      {isSelected ? (
        <button className={styles.unjoinButton} onClick={onUnselect}>-Unjoin</button>
      ) : (
        <button className={styles.joinButton} onClick={onSelect}>+Join</button>
      )}
    </div>
  );
};

export default AchievementButton;
