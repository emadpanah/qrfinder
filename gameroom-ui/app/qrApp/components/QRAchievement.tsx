import React, { useEffect, useRef, useState } from 'react';
import { Achievement, AchievementSelectedFull } from '@/app/lib/definitions';
import {
  fetchQrCodesByAchievementId,
  fetchCampaignById,
  fetchQrScannedByUser,
  doneSelectAchievement,
  fetchDefaultCurrency,
  fetchBalance,
  fetchAchievementSelectFullByUA,
} from '@/app/lib/api';
import QRAchievementQrView from './QRAchievementQrView';
import { useUser } from '@/app/contexts/UserContext';
import styles from '../css/qrApp.module.css';
import { QRCode, QRScanFull } from '../../lib/definitions';
import { QRCodeSVG } from 'qrcode.react';
import { calculateRemainingDays, calculateTotalDays } from '../../lib/utils';

interface QRAchievementProps {
  achievement: Achievement;
}

const QRAchievement: React.FC<QRAchievementProps> = ({ achievement }) => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [qrCodesScanned, setqrCodesScanned] = useState<QRScanFull[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const { accountData, userId, updateBalance } = useUser();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRScanFull | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isAchievementComplete, setIsAchievementComplete] = useState(false);
  const [achievementSelected, setAchievementSelected] =
    useState<AchievementSelectedFull>();

  const remainingDays = calculateRemainingDays(achievement.expirationDate);
  const totalDays = calculateTotalDays(
    achievement.startDate,
    achievement.expirationDate,
  );
  const passedDays = totalDays - remainingDays;

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const campaign = await fetchCampaignById(achievement.campaignId);
        if (campaign.ownerAddress === userId) {
          setIsOwner(true);
        }
        const qrCodes = await fetchQrCodesByAchievementId(achievement._id);
        setQrCodes(qrCodes);
        const selected = await fetchAchievementSelectFullByUA(
          achievement._id,
          userId!,
        );
        if (selected) {
          setAchievementSelected(selected);
          const scanned = await fetchQrScannedByUser(
            userId!,
            selected.achievementId,
          );
          setqrCodesScanned(scanned);
          if (scanned.length === achievement.qrTarget) {
            const done = await doneSelectAchievement(selected._id);
            if (done) {
              setIsAchievementComplete(true);
              updateBalance();
            }
          }
        }
      } catch (error) {
        console.error('Error loading QR codes or checking ownership:', error);
      }
    };

    checkOwnership();
  }, [userId, achievement.qrTarget, achievement.campaignId, achievement._id]);

  const handleQRClick = (qrCode: QRScanFull) => {
    setSelectedQR(qrCode);
    setShowQRDialog(true);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dialogRef.current &&
      !dialogRef.current.contains(event.target as Node)
    ) {
      setShowQRDialog(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Animation for reward tokens
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

  return (
    <div className={styles.qrAchievement}>
      <div className="relative mb-4 ml-6 mr-6 mt-4 border border-gray-300 p-1 pb-1 pl-6 pr-6">
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
              <span className="inline-block text-xs font-semibold text-blue-600 ">
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
      <div className="relative mb-4 ml-6 mr-6 mt-4 border border-gray-300 p-1 pl-6 pr-6">
        <h2 className="text-l relative pb-2 text-center font-semibold">
          Scanned QR Codes
        </h2>
        <div className={styles.qrCodeGrid}>
          {qrCodesScanned.map((qrCode, index) => (
            <div
              key={index}
              className={styles.qrThumbnail}
              onClick={() => handleQRClick(qrCode)}
            >
              <QRCodeSVG value={qrCode.link} size={64} />
              <p className={styles.qrOrder}>Order: {qrCode.order}</p>
            </div>
          ))}
          {showQRDialog && selectedQR && (
            <div className={styles.qrDialog}>
              <div className={styles.qrDialogContent} ref={dialogRef}>
                <QRCodeSVG value={selectedQR.link} size={256} />
              </div>
            </div>
          )}
        </div>
        <div className="relative pt-1">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="inline-block rounded-full bg-green-200 px-2 py-1 text-xs font-semibold uppercase text-green-600">
                {Math.round(
                  (qrCodesScanned.length / achievement.qrTarget) * 100,
                )}
                %
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-semibold text-green-600">
                Progress
              </span>
            </div>
          </div>
          <div className="mb-1 flex h-2 overflow-hidden rounded bg-green-200 text-xs">
            <div
              style={{
                width: `${(qrCodesScanned.length / achievement.qrTarget) * 100}%`,
              }}
              className="flex flex-col justify-center whitespace-nowrap bg-green-500 text-center text-white shadow-none"
            ></div>
          </div>
          <p className="text-center text-xs text-green-600 ">
            you need to scan {achievement.qrTarget} from {qrCodes.length}{' '}
            qrcodes
          </p>
          <p className="text-center text-xs text-red-600 ">
            {achievement.qrTarget - qrCodesScanned.length} QR codes remaining.
          </p>
        </div>
      </div>
      {isOwner && (
        <div className="relative mb-4 ml-6 mr-6 mt-4 border border-gray-300 p-4 text-center">
          <h2
            className="text-l relative mb-2 inline-block pt-2 text-center font-semibold "
            style={{ top: '-1rem' }}
          >
            QR Codes
            <p className="text-xs text-red-500">
              campaign owner section, print qr codes and put them in different
              places
            </p>
          </h2>
          <QRAchievementQrView qrCodes={qrCodes} />
        </div>
      )}
    </div>
  );
};

export default QRAchievement;
