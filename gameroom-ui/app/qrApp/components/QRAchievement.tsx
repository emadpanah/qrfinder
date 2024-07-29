// app/qrApp/components/QRAchievement.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Achievement, AchievementSelectedFull } from '@/app/lib/definitions';
import { fetchQrCodesByAchievementId, fetchCampaignById, fetchQrScannedByUser } from '@/app/lib/api'; // Assume these API calls exist
import QRAchievementQrView from './QRAchievementQrView';
import { useUser } from '@/app/contexts/UserContext';
import styles from '../css/qrApp.module.css';
import {QRCode, QRScanFull } from '../../lib/definitions';
import { QRCodeSVG } from 'qrcode.react';
interface QRAchievementProps {
  achievement: Achievement;
}

const QRAchievement: React.FC<QRAchievementProps> = ({ achievement }) => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [qrCodesScanned, setqrCodesScanned] = useState<QRScanFull[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const { accountData, userId } = useUser();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRScanFull | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const campaign = await fetchCampaignById(achievement.campaignId);
        if (campaign.ownerAddress === accountData.address) {
          setIsOwner(true);
        }
        if (isOwner) {
          const qrCodes = await fetchQrCodesByAchievementId(achievement._id);
          setQrCodes(qrCodes);
        }
        if(userId)
        {
          const scanned = await fetchQrScannedByUser(userId);
          setqrCodesScanned(scanned);
        }
      } catch (error) {
        console.error('Error loading QR codes or checking ownership:', error);
      }
    };

    checkOwnership();
  }, [achievement.campaignId, achievement._id, accountData.address, isOwner]);


  const handleQRClick = (qrCode: QRScanFull) => {
    setSelectedQR(qrCode);
    setShowQRDialog(true);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
      setShowQRDialog(false);
    }
  };

  return (
    <div className={styles.qrAchievement}>
      <h1 className="text-2xl font-bold">{achievement.name}</h1>
      <p>{achievement.description}</p>
      <p>Will expire at {achievement.expirationDate.toString()}</p>
      <div className={styles.qrCodeGrid}>
      {qrCodesScanned.map((qrCode, index) => (
        <div key={index} className={styles.qrThumbnail} onClick={() => handleQRClick(qrCode)}>
          <QRCodeSVG value={qrCode.link} size={64} />
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
      {isOwner && (
        <div>
          <h2 className="text-xl font-semibold mb-2">QR Codes</h2>
          <QRAchievementQrView qrCodes={qrCodes} />
        </div>
      )}
    </div>
  );
};

export default QRAchievement;
