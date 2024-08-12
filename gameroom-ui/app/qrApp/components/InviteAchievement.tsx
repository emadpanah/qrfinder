import React, { useEffect, useRef, useState } from 'react';
import { Achievement, AchievementSelectedRef } from '@/app/lib/definitions';
import { fetchCampaignById, fetchSelFullAchisRefByUserIdCamId } from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import styles from '../css/qrApp.module.css';
import { calculateRemainingDays, calculateTotalDays, shortenAddress } from '../../lib/utils';

interface InviteAchievementProps {
  achievement: Achievement;
}

const InviteAchievement: React.FC<InviteAchievementProps> = ({ achievement }) => {
  const [selectedAchievementsRef, setSelectedAchievementsRef] = useState<AchievementSelectedRef[]>([]);
  const { accountData, userId, updateBalance } = useUser();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isAchievementComplete, setIsAchievementComplete] = useState(false);
  
  const remainingDays = calculateRemainingDays(achievement.expirationDate);
  const totalDays = calculateTotalDays(achievement.startDate, achievement.expirationDate);
  const passedDays = totalDays - remainingDays;

  // Calculate the number of invited users and the target
  const invitedUsersCount = selectedAchievementsRef.length;
  const targetInvitations = achievement.qrTarget; // assuming qrTarget is the required number of invites
  const progressPercentage = (invitedUsersCount / targetInvitations) * 100;
  const remainingInvitations = targetInvitations - invitedUsersCount;

  // Reward animation state
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      if (count < achievement.reward.tokens) {
        count += 10;
        document.getElementById('token-count')!.textContent = count.toString();
      } else {
        clearInterval(interval);
        document.getElementById('token-count')!.textContent = achievement.reward.tokens.toString();
      }
    }, 15);

    return () => clearInterval(interval);
  }, [achievement.reward.tokens]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaign = await fetchCampaignById(achievement.campaignId);
        if (campaign.ownerAddress === accountData.address) {
          setIsOwner(true);
        }
        const selectedRefs = await fetchSelFullAchisRefByUserIdCamId(userId!, achievement.campaignId);
        setSelectedAchievementsRef(selectedRefs);

        if (selectedRefs.length >= targetInvitations) {
          setIsAchievementComplete(true);
          updateBalance();
        }
      } catch (error) {
        console.error('Error fetching data for Invite Achievement:', error);
      }
    };

    fetchData();
  }, [accountData.address, userId, achievement.campaignId, targetInvitations, updateBalance]);

  return (
    <div className={styles.qrAchievement}>
      <div className="relative border border-gray-300 p-1 pl-6 pr-6 pb-1 ml-6 mt-4 mr-6 mb-4">
        <h1 className="text-xl text-center font-semibold pt-1 relative pb-1">
          {achievement.name}
        </h1>
        <p className="text-center">
          <span id="token-count" className={isAchievementComplete ? `${styles.greenText}` : ''} style={{ fontSize: '4rem' }}>0</span><span style={{ color: '#38a169', fontSize: '2rem' }}>g</span>
        </p>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                {passedDays} / {totalDays} days
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                Days Progress
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-red-200" title={`${remainingDays} days remaining`}>
            <div style={{ width: `${(passedDays / totalDays) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
          </div>
          <p className="text-center text-xs text-red-600">{remainingDays} days remaining</p>
        </div>
        {isAchievementComplete && (
          <div className={styles.congratsMessage}>
            Congratulations! You have completed the achievement.
            <div className={styles.stars}></div>
          </div>
        )}
      </div>

      {/* Progress bar for invited users */}
      <div className="relative border border-gray-300 p-4 ml-6 mt-4 mr-6 mb-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                {invitedUsersCount} / {targetInvitations} invited
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                Invitations Progress
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-green-200">
            <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
          </div>
          <p className="text-center text-xs text-green-600">
            {remainingInvitations > 0 ? `${remainingInvitations} more invitations needed` : 'Invitation target achieved!'}
          </p>
        </div>
      </div>

      {/* Table for displaying AchievementSelectedRef properties */}
      <div className="relative border border-gray-300 p-4 ml-6 mt-4 mr-6 mb-4">
        <h2 className="text-l text-center font-semibold relative pb-2">
          Selected Achievements
        </h2>
        <table className="table-auto w-full text-center">
          <thead>
            <tr>
              <th className="px-4 py-2">Achievement</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Added Date</th>
            </tr>
          </thead>
          <tbody>
            {selectedAchievementsRef.length > 0 ? (
              selectedAchievementsRef.map((ref) => (
                <tr key={ref._id.toString()}>
                  <td className="border px-4 py-2">
                    <div className="relative group">
                      <span className="cursor-pointer">{shortenAddress(ref.name, 6)}</span>
                      <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-4 left-1/2 transform -translate-x-1/2 -translate-y-full">
                        {ref.name}
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="relative group">
                      <span className="cursor-pointer">{shortenAddress(ref.userId.toString(), 6)}</span>
                      <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-4 left-1/2 transform -translate-x-1/2 -translate-y-full">
                        {ref.userId.toString()}
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2">{new Date(ref.addedDate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border px-4 py-2">There is no invitation from you.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InviteAchievement;
