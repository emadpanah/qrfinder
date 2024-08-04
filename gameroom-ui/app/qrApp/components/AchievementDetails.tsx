// app/qrApp/components/AchievementDetails.tsx
import React from 'react';
import { AchievementSelectedFull, Achievement } from '@/app/lib/definitions';
import QRAchievement from '../components/QRAchievement';
import InviteAchievement from '../components/InviteAchievement';

interface AchievementDetailsProps {
  achievement: AchievementSelectedFull;
}

const AchievementDetails: React.FC<AchievementDetailsProps> = ({ achievement }) => {
  switch (achievement.achievementType) {
    case 'qrcode':
      return <QRAchievement achievement={achievement} />;
    case 'inviteuser':
      return <InviteAchievement achievement={achievement} />;
    default:
      return <div>Unsupported achievement type</div>;
  }
};

export default AchievementDetails;
