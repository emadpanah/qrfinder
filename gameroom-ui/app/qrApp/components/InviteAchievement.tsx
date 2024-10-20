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

  const remainingDays = calculateRemainingDays(achievement.expirationDate);
  const totalDays = calculateTotalDays(achievement.startDate, achievement.expirationDate);
  const passedDays = totalDays - remainingDays;

  const invitedUsersCount = selectedAchievementsRef.length;
  const targetInvitations = achievement.qrTarget;
  const daysProgressPercentage = (passedDays / totalDays) * 100;
  const invitationsProgressPercentage = (invitedUsersCount / targetInvitations) * 100;
  const remainingInvitations = targetInvitations - invitedUsersCount;
  const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const inviteMessage = `Hi, this is ${telegramId}. If you join this shop and invite your friends, you can earn ${achievement.reward.tokens} tokens for each invite. Don't miss this chance!`;
  const inviteMessageCopy = `Hi, this is ${telegramId}. If you join this shop and invite your friends, you can earn ${achievement.reward.tokens} tokens for each invite. Don't miss this chance! ${process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL_MAGHAZI}?start=said=${selectedAchievementFull?._id}`;
  

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

  // Create invite link dynamically
  const createInviteLink = () => {
    console.log("process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL_MAGHAZI", process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL_MAGHAZI);
    return `${process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL_MAGHAZI}?start=said=${selectedAchievementFull?._id}`;
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteMessageCopy)
        .then(() => alert('Invite message copied to clipboard!'))
        .catch((e) => {
          console.error('Clipboard API failed. Falling back to older method.', e);
          fallbackCopyTextToClipboard(inviteMessageCopy);
        });
    } else {
      fallbackCopyTextToClipboard(inviteMessageCopy); // Fallback for older browsers
    }
  };

  // Fallback function for older browsers
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
        {selectedAchievementFull && (
          <div className={`${styles.inviteSection} mb-4 text-center border border-gray-300 p-4`}>
            <p className={`${styles.sectionTitle}`}>Your Invite Message</p>
            <p>
           {inviteMessage}
            </p>
            <div className="flex justify-center items-center">
              <input type="text" value={createInviteLink()} readOnly className="border px-2 py-1" />
              <button onClick={copyInviteLink} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">Copy Invite Link</button>
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
                    <td className="border px-4 py-2">{ref.telegramUserName}</td>
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
