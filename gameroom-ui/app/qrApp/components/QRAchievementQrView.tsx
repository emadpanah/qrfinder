// app/qrApp/components/QRAchievementQrView.tsx
import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from '../css/qrApp.module.css';
import {QRCode} from '../../lib/definitions';

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
  );
};

export default QRAchievementQrView;
