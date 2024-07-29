// app/qrApp/components/InviteAchievement.tsx
import React from 'react';
import { Achievement } from '@/app/lib/definitions';

interface InviteAchievementProps {
  achievement: Achievement;
}

const InviteAchievement: React.FC<InviteAchievementProps> = ({ achievement }) => {
  return (
    <div>
      <h1>Invite Achievement</h1>
      <p>{achievement.description}</p>
      {/* Add additional details and functionalities for Invite achievements */}
    </div>
  );
};

export default InviteAchievement;
