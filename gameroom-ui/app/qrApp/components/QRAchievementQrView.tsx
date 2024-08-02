// app/qrApp/components/QRAchievementQrView.tsx
import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from '../css/qrApp.module.css';
import {QRCode} from '../../lib/definitions';
import { toast } from 'react-toastify';
import { shortenUrl } from '@/app/lib/utils';

interface QRAchievementQrViewProps {
  qrCodes: QRCode[];
}

const QRAchievementQrView: React.FC<QRAchievementQrViewProps> = ({ qrCodes }) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleQRClick = (qrCode: QRCode) => {
    setSelectedQR(qrCode);
    setShowQRDialog(true);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
      setShowQRDialog(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(selectedQR!.link);
    toast.success('Link copied to clipboard!');
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className={styles.qrCodeGrid}>
      {qrCodes.map((qrCode, index) => (
        <div key={index} className={styles.qrThumbnail} onClick={() => handleQRClick(qrCode)}>
          <QRCodeSVG value={qrCode.link} size={64} />
          <p  className={`text-xs ${styles.qrOrder}`} >{qrCode.order}</p> 
        </div>
      ))}
      {showQRDialog && selectedQR && (
        <div className={styles.qrDialog}>
          <div className={styles.qrDialogContent} ref={dialogRef}>
            <QRCodeSVG value={selectedQR.link} size={256} onClick={handleCopyLink} />
            <p className={styles.dialogLink} onClick={handleCopyLink} style={{ cursor: 'pointer' }}>{shortenUrl(selectedQR!.link)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRAchievementQrView;
