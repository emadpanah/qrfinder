// app/qrApp/components/QRAchievement.tsx
import React from 'react';
import { AchievementSelectedFull } from '@/app/lib/definitions';

interface QRAchievementProps {
  achievement: AchievementSelectedFull;
}

const QRAchievement: React.FC<QRAchievementProps> = ({ achievement }) => {
  return (
    <div>
      <h1>QR Achievement</h1>
      <p>{achievement.description}</p>
      {/* Add additional details and functionalities for QR achievements */}
    </div>
  );
};

export default QRAchievement;
