import React from 'react';
import { Achievement } from '@/app/lib/definitions';
import QRAchievement from '../components/QRAchievement';
import InviteAchievement from '../components/InviteAchievement';
import { FaArrowLeft } from 'react-icons/fa';

interface AchievementDetailsProps {
  achievement: Achievement;
  onBack: () => void;
}

const AchievementDetails: React.FC<AchievementDetailsProps> = ({ achievement, onBack }) => {
  return (
    <div>
      <button onClick={onBack} className="text-white focus:outline-none">
        <FaArrowLeft />
      </button>
      {achievement.achievementType === 'qrcode' ? (
        <QRAchievement achievement={achievement} />
      ) : achievement.achievementType === 'inviteuser' ? (
        <InviteAchievement achievement={achievement} />
      ) : (
        <div>Unsupported achievement type</div>
      )}
    </div>
  );
};

export default AchievementDetails;
