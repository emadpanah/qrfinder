import React from 'react';
import styles from '../css/qrApp.module.css';

interface AchievementButtonProps {
  name: string;
  reward: string;
  remainingDays: number;
  onSelect: () => void; // Add this prop for the button click handler
}

const AchievementButton: React.FC<AchievementButtonProps> = ({ name, reward, remainingDays, onSelect }) => {
  return (
    <div className={styles.achievementButton}>
      <div className={styles.achievementText}>
        <h3>{name}</h3>
        <p>Reward: {reward}</p>
        <p>{remainingDays} days left</p>
      </div>
      <button className={styles.joinButton} onClick={onSelect}>+Join</button>
    </div>
  );
};

export default AchievementButton;
