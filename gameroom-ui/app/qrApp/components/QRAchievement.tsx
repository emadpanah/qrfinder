// app/qrApp/components/QRAchievement.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Achievement, AchievementSelectedFull } from '@/app/lib/definitions';
import { fetchQrCodesByAchievementId, fetchCampaignById, fetchQrScannedByUser, doneSelectAchievement, fetchDefaultCurrency, fetchgBalance } from '@/app/lib/api'; // Assume these API calls exist
import QRAchievementQrView from './QRAchievementQrView';
import { useUser } from '@/app/contexts/UserContext';
import styles from '../css/qrApp.module.css';
import { QRCode, QRScanFull } from '../../lib/definitions';
import { QRCodeSVG } from 'qrcode.react';
import { calculateRemainingDays, calculateTotalDays } from '../../lib/utils';

interface QRAchievementProps {
  achievement: AchievementSelectedFull;
}

const QRAchievement: React.FC<QRAchievementProps> = ({ achievement }) => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [qrCodesScanned, setqrCodesScanned] = useState<QRScanFull[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const { accountData, userId } = useUser();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRScanFull | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const remainingDays = calculateRemainingDays(achievement.expirationDate); 
  const totalDays = calculateTotalDays(achievement.startDate, achievement.expirationDate);
  const passedDays = totalDays - remainingDays;

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const campaign = await fetchCampaignById(achievement.campaignId);
        if (campaign.ownerAddress === accountData.address) {
          setIsOwner(true);
        }
        const qrCodes = await fetchQrCodesByAchievementId(achievement.achievementId);
        setQrCodes(qrCodes);
        if (userId) {
          const scanned = await fetchQrScannedByUser(userId, achievement.achievementId);
          setqrCodesScanned(scanned);
          if(scanned.length === achievement.qrTarget)
          {
            const done = await doneSelectAchievement(achievement._id); 
            if (done) {
              const defaultCurr = await fetchDefaultCurrency();
              const newBalance = await fetchgBalance(userId, defaultCurr._id);
              //updateBalance(newBalance); // Update the balance in the context
            }
          }
        }
      } catch (error) {
        console.error('Error loading QR codes or checking ownership:', error);
      }
    };

    checkOwnership();
  }, [achievement.campaignId, achievement._id, achievement.achievementId, achievement.qrTarget, accountData.address, userId]);

  const handleQRClick = (qrCode: QRScanFull) => {
    setSelectedQR(qrCode);
    setShowQRDialog(true);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
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
        document.getElementById('token-count')!.textContent = achievement.reward.tokens.toString();
      }
    }, 15);

    return () => clearInterval(interval);
  }, [achievement.reward.tokens]);

  return (
    <div className={styles.qrAchievement}>
      <div className="relative border border-gray-300 p-1 pl-6 pr-6 pb-1 ml-6 mt-4 mr-6 mb-4">
        <h1 className="text-xl text-center font-semibold pt-1 relative pb-1" >
          {achievement.name}
        </h1>
        <p className="text-center">
          <span id="token-count" style={{ color: '#ffd700', fontSize: '4rem' }}>0</span><span style={{ color: '#ffd700', fontSize: '2rem' }}>g</span> 
        </p>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
              {passedDays} / {totalDays} days
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600 ">
              Days Progress
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-red-200" title={`${remainingDays} days remaining`}>
          <div style={{ width: `${(passedDays / totalDays) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
        </div>
        <p className="text-center text-xs text-red-600">{remainingDays} days remaining</p>
      </div>
      </div>
      <div className="relative border border-gray-300 p-1 pl-6 pr-6 ml-6 mt-4 mr-6 mb-4">
      <h2 className="text-l text-center font-semibold relative pb-2" >
        Scanned QR Codes
      </h2>
      <div className={styles.qrCodeGrid}>
        {qrCodesScanned.map((qrCode, index) => (
          <div key={index} className={styles.qrThumbnail} onClick={() => handleQRClick(qrCode)}>
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
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
              {Math.round((qrCodesScanned.length / achievement.qrTarget) * 100)}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-green-600">
              Progress
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-green-200">
          <div style={{ width: `${(qrCodesScanned.length / achievement.qrTarget) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
        </div>
        <p className="text-center text-xs text-green-600 ">you need to scan {achievement.qrTarget} from {qrCodes.length} qrcodes</p>
      </div>
    </div>
     {isOwner && (
        <div className="relative border text-center border-gray-300 p-4 ml-6 mt-4 mr-6 mb-4">
            <h2 className="text-l text-center pt-2 font-semibold mb-2 relative inline-block " style={{ top: '-1rem' }}>
                QR Codes
              <p className='text-xs text-red-500'>campaign owner section, print qr codes and put them in different places</p>
            </h2>
          <QRAchievementQrView qrCodes={qrCodes} />
        </div>

      )}
    </div>
  );
};

export default QRAchievement;
