import React, { useEffect, useRef, useState } from 'react';
import { Achievement, AchievementSelectedRef } from '@/app/lib/definitions';
import {
  fetchCampaignById,
  fetchSelFullAchisRefByUserIdCamId,
} from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import styles from '../css/qrApp.module.css';
import {
  calculateRemainingDays,
  calculateTotalDays,
  shortenAddress,
} from '../../lib/utils';

interface InviteAchievementProps {
  achievement: Achievement;
}

const InviteAchievement: React.FC<InviteAchievementProps> = ({
  achievement,
}) => {
  const [selectedAchievementsRef, setSelectedAchievementsRef] = useState<
    AchievementSelectedRef[]
  >([]);
  const { accountData, userId, updateBalance } = useUser();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isAchievementComplete, setIsAchievementComplete] = useState(false);

  const remainingDays = calculateRemainingDays(achievement.expirationDate);
  const totalDays = calculateTotalDays(
    achievement.startDate,
    achievement.expirationDate,
  );
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
        document.getElementById('token-count')!.textContent =
          achievement.reward.tokens.toString();
      }
    }, 15);

    return () => clearInterval(interval);
  }, [achievement.reward.tokens]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaign = await fetchCampaignById(achievement.campaignId);
        if (campaign.ownerAddress === userId) {
          setIsOwner(true);
        }
        const selectedRefs = await fetchSelFullAchisRefByUserIdCamId(
          userId!,
          achievement.campaignId,
        );
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
  }, [userId, achievement.campaignId, targetInvitations, updateBalance]);

  return (
    <div className={styles.qrAchievement}>
      <div className="relative mb-4 mt-4 border border-gray-300 p-1 pb-1 pl-6  pr-6">
        <h1 className="relative pb-1 pt-1 text-center text-xl font-semibold">
          {achievement.name}
        </h1>
        <p className="text-center">
          <span
            id="token-count"
            className={isAchievementComplete ? `${styles.greenText}` : ''}
            style={{ fontSize: '4rem' }}
          >
            0
          </span>
          <span style={{ color: '#38a169', fontSize: '2rem' }}>g</span>
        </p>
        <div className="relative pt-1">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="inline-block rounded-full bg-red-200 px-2 py-1 text-xs font-semibold uppercase text-red-600">
                {passedDays} / {totalDays} days
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-semibold text-blue-600">
                Days Progress
              </span>
            </div>
          </div>
          <div
            className="mb-1 flex h-2 overflow-hidden rounded bg-red-200 text-xs"
            title={`${remainingDays} days remaining`}
          >
            <div
              style={{ width: `${(passedDays / totalDays) * 100}%` }}
              className="flex flex-col justify-center whitespace-nowrap bg-red-500 text-center text-white shadow-none"
            ></div>
          </div>
          <p className="text-center text-xs text-red-600">
            {remainingDays} days remaining
          </p>
        </div>
        {isAchievementComplete && (
          <div className={styles.congratsMessage}>
            Congratulations! You have completed the achievement.
            <div className={styles.stars}></div>
          </div>
        )}
      </div>

      {/* Progress bar for invited users */}
      <div className="relative mb-4 mt-4 border border-gray-300  p-4">
        <div className="relative pt-1">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="inline-block rounded-full bg-green-200 px-2 py-1 text-xs font-semibold uppercase text-green-600">
                {invitedUsersCount} / {targetInvitations} invited
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-semibold text-green-600">
                Invitations Progress
              </span>
            </div>
          </div>
          <div className="mb-1 flex h-2 overflow-hidden rounded bg-green-200 text-xs">
            <div
              style={{ width: `${progressPercentage}%` }}
              className="flex flex-col justify-center whitespace-nowrap bg-green-500 text-center text-white shadow-none"
            ></div>
          </div>
          <p className="text-center text-xs text-green-600">
            {remainingInvitations > 0
              ? `${remainingInvitations} more invitations needed`
              : 'Invitation target achieved!'}
          </p>
        </div>
      </div>

      {/* Table for displaying AchievementSelectedRef properties */}
      <div className="relative mb-2 mt-4 border border-gray-300 p-4">
        <h2 className="text-l relative pb-2 text-center font-semibold">
          Invitation List
        </h2>
        <table className="w-full table-auto text-center text-xs">
          <thead>
            <tr>
              <th className="px-4 py-2">achievement</th>
              <th className="px-4 py-2">user</th>
              <th className="px-4 py-2">date</th>
            </tr>
          </thead>
          <tbody>
            {selectedAchievementsRef.length > 0 ? (
              selectedAchievementsRef.map((ref) => (
                <tr key={ref._id.toString()}>
                  <td className="border px-4 py-2">
                    <div className="group relative">
                      <span className="cursor-pointer">
                        {shortenAddress(ref.name, 4)}
                      </span>
                      <div className="absolute left-1/2 hidden -translate-x-1/2 -translate-y-full transform rounded bg-gray-700 px-4 py-1 text-xs text-white group-hover:block">
                        {ref.name}
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="group relative">
                      <span className="cursor-pointer">
                        {shortenAddress(ref.userId.toString(), 6)}
                      </span>
                      <div className="absolute left-1/2 hidden -translate-x-1/2 -translate-y-full transform rounded bg-gray-700 px-4 py-1 text-xs text-white group-hover:block">
                        {ref.userId.toString()}
                      </div>
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(ref.addedDate).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border px-4 py-2">
                  There is no invitation from you.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InviteAchievement;
