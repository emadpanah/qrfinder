// app/qrApp/components/QRAchievement.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Achievement, AchievementSelectedFull } from '@/app/lib/definitions';
import { fetchQrCodesByAchievementId, fetchCampaignById, fetchQrScannedByUser } from '@/app/lib/api'; // Assume these API calls exist
import QRAchievementQrView from './QRAchievementQrView';
import { useUser } from '@/app/contexts/UserContext';
import styles from '../css/qrApp.module.css';
import {QRCode, QRScanFull } from '../../lib/definitions';
import { QRCodeSVG } from 'qrcode.react';
import { calculateRemainingDays, calculateTotalDays } from '../../lib/utils';
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
        //if (isOwner) {
          const qrCodes = await fetchQrCodesByAchievementId(achievement._id);
          setQrCodes(qrCodes);
        //}
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

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className={styles.qrAchievement}>
      <div className="relative border border-gray-300 p-1 pl-6 pr-6 pb-1 ml-6 mt-4 mr-6 mb-4">
        <h1 className="text-xl text-center font-semibold pt-1 relative pb-1" >
          {achievement.name}
        </h1>
        <p className="text-center">{achievement.description}</p>
        {/* <p className="text-center pt-1">
        achievement will be expires in <span className='text-red-500 text-xs'>({remainingDays} days.)</span> 
        </p> */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              {passedDays} / {totalDays} days
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600 ">
              Days Progress
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-blue-200" title={`${remainingDays} days remaining`}>
          <div style={{ width: `${(passedDays / totalDays) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
        </div>
      </div>
      <p className="text-center text-xs text-green-600 pt-1">you need to scan {achievement.qrTarget} from {qrCodes.length} qrcodes</p>
      </div>
      <div className="relative border border-gray-300 p-1 pl-6 pr-6 ml-6 mt-4 mr-6 mb-4">
      <h2 className="text-l text-center font-semibold relative " >
        Scanned QR Codes
      </h2>
      <div className={styles.qrCodeGrid}>
        {qrCodesScanned.map((qrCode, index) => (
          <div key={index} className={styles.qrThumbnail} onClick={() => handleQRClick(qrCode)}>
            <QRCodeSVG value={qrCode.link} size={96} />
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
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
              {Math.round((qrCodesScanned.length / qrCodes.length) * 100)}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-red-600">
              Progress
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
          <div style={{ width: `${(qrCodesScanned.length / qrCodes.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
        </div>
      </div>
    </div>
     {isOwner && (
        <div className="relative border text-center border-gray-300 p-4 ml-6 mt-4 mr-6 mb-4">
            <h2 className="text-l text-center pt-2 font-semibold mb-2 relative inline-block " style={{ top: '-1rem' }}>
                QR Codes
              <p className='text-xs text-red-500'>just campaign owner can see, print qr in different places</p>
            </h2>
          <QRAchievementQrView qrCodes={qrCodes} />
        </div>

      )}
    </div>
  );
};

export default QRAchievement;
