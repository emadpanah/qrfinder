import React, { useEffect, useState } from 'react';
import { Achievement, AchievementSelectedFull, AchievementSelectedRef } from '@/app/lib/definitions';
import { fetchAchievementSelectFullByUA, fetchCampaignById, fetchSelFullAchisRefByUserIdCamId } from '@/app/lib/api';
import { useUser } from '@/app/contexts/UserContext';
import styles from '../css/qrApp.module.css';
import { calculateRemainingDays, calculateTotalDays } from '../../lib/utils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface InviteAchievementProps {
  achievement: Achievement;
}

const InviteAchievement: React.FC<InviteAchievementProps> = ({ achievement }) => {
  const [selectedAchievementsRef, setSelectedAchievementsRef] = useState<AchievementSelectedRef[]>([]);
  const [selectedAchievementFull, setSelectedAchievementFull] = useState<AchievementSelectedFull>();
  const { accountData, userId, updateBalance } = useUser();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isAchievementComplete, setIsAchievementComplete] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null); // Store the invite link

  const remainingDays = calculateRemainingDays(achievement.expirationDate);
  const totalDays = calculateTotalDays(achievement.startDate, achievement.expirationDate);
  const passedDays = totalDays - remainingDays;

  const invitedUsersCount = selectedAchievementsRef.length;
  const targetInvitations = achievement.qrTarget;
  const daysProgressPercentage = (passedDays / totalDays) * 100;
  const invitationsProgressPercentage = (invitedUsersCount / targetInvitations) * 100;
  const remainingInvitations = targetInvitations - invitedUsersCount;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const campaign = await fetchCampaignById(achievement.campaignId);
        if (campaign.ownerAddress === userId) {
          setIsOwner(true);
        }
        const selectedRefs = await fetchSelFullAchisRefByUserIdCamId(userId!, achievement.campaignId);
        setSelectedAchievementsRef(selectedRefs);

        fetchAchievementSelectFullByUA(achievement._id, userId!)
          .then((selectedfull) => {
            setSelectedAchievementFull(selectedfull);
            setInviteLink(selectedfull.inviteLink);
          })
          .catch((error) => {
            console.error("Error fetching achievement:", error);
          });

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

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('Invite message copied to clipboard!');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert('Failed to copy invite message. Please copy it manually.');
    }
    
    document.body.removeChild(textArea);
  };
  
  const copyInviteLink = () => {
    const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    const tokenReward = achievement.reward?.tokens ?? 100;
    const additionalTokens = tokenReward * 2;
    const totalTokensIfComplete = tokenReward * 3;
  
    const inviteMessage = `Hi, this is ${telegramId}. If you join this shop and invite your friends, you can earn ${tokenReward} tokens for each invite. If your friend buys any product, you will get an additional ${additionalTokens} tokens. Plus, if you complete the achievement, you will receive ${totalTokensIfComplete} tokens. Don't miss this chance! ${inviteLink}`;
  
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteMessage)
        .then(() => alert('Invite message copied to clipboard!'))
        .catch((e) => {
          console.error('Clipboard API failed. Falling back to older method.', e);
          fallbackCopyTextToClipboard(inviteMessage);
        });
    } else {
      fallbackCopyTextToClipboard(inviteMessage); // Fallback for older browsers
    }
  };
  
  return (
    <div className={styles.qrAchievement}>
      <div className="relative mb-4 mt-4 border border-gray-300 p-1 pb-1 pl-6 pr-6">
        <h1 className="relative pb-1 pt-1 text-center text-xl font-semibold">
          {achievement.name}
        </h1>
        <p className="text-center">
          <span id="token-count" className={isAchievementComplete ? `${styles.greenText}` : ''} style={{ fontSize: '4rem' }}>
          {accountData.gbalance}
          </span>
          <span style={{ color: '#38a169', fontSize: '2rem' }}>g</span>
        </p>

        {/* Invite Message Section with title-like styling */}
        {inviteLink && (
          <div className={`${styles.inviteSection} mb-4 text-center border border-gray-300 p-4`}>
            <p className={`${styles.sectionTitle}`}>Your Invite Message</p>
            <p>
              Hi, this is {window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'Emad'}. If you join this shop and invite your friends, you can earn {achievement.reward?.tokens ?? 100} tokens for each invite. If your friend buys any product, you will get an additional {achievement.reward?.tokens ? achievement.reward.tokens * 2 : 200} tokens. Plus, if you complete the achievement, you will receive {achievement.reward?.tokens ? achievement.reward.tokens * 3 : 300} tokens. Don&apos;t miss this chance!
            </p>
            <div className="flex justify-center items-center">
              <input type="text" value={inviteLink} readOnly className="border px-2 py-1" />
              <button onClick={copyInviteLink} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">Copy</button>
            </div>
          </div>
        )}

        {/* Circular Progress Bars for Days and Invitations Progress */}
        <div className={`${styles.circularProgressWrapper} border border-gray-300 p-4`}>
          <div className={styles.circularProgressItem}>
            <CircularProgressbar
              value={daysProgressPercentage}
              text={`${remainingDays} days`}
              styles={buildStyles({
                pathColor: '#38a169',
                textColor: '#38a169',
                trailColor: '#d6d6d6',
              })}
            />
            <p className={styles.circularProgressLabel}>Days</p>
          </div>

          <div className={styles.circularProgressItem}>
            <CircularProgressbar
              value={invitationsProgressPercentage}
              text={`${invitedUsersCount}/${targetInvitations}`}
              styles={buildStyles({
                pathColor: '#38a169',
                textColor: '#38a169',
                trailColor: '#d6d6d6',
              })}
            />
            <p className={styles.circularProgressLabel}>Invitations</p>
          </div>
        </div>

        {/* Invitation List Section with border */}
        <div className={`${styles.invitationListContainer} border border-gray-300 p-4`}>
          <h2 className="text-l relative pb-2 text-center font-semibold">Invitation List</h2>
          <table className={`${styles.invitationListTable}`}>
            <thead>
              <tr>
                <th className="px-4 py-2">Achievement</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {selectedAchievementsRef.length > 0 ? (
                selectedAchievementsRef.map((ref) => (
                  <tr key={ref._id.toString()}>
                    <td className="border px-4 py-2">{ref.name}</td>
                    <td className="border px-4 py-2">{ref.userId.toString()}</td>
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
    </div>
  );
};

export default InviteAchievement;
