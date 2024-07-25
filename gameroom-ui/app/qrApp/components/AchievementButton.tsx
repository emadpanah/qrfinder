import React, { useState, useRef, useEffect } from 'react';
import styles from '../css/qrApp.module.css';
import { QRCodeSVG } from 'qrcode.react';

interface AchievementButtonProps {
  name: string;
  reward: string;
  remainingDays: number;
  onSelect: () => void;
  onUnselect: () => void;
  isSelected: boolean;
  link: string;
}

const AchievementButton: React.FC<AchievementButtonProps> = ({
  name,
  reward,
  remainingDays,
  onSelect,
  onUnselect,
  isSelected,
  link,
}) => {
  const [showQRDialog, setShowQRDialog] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleQRClick = () => {
    setShowQRDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
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

  const shortenUrl = (url: string) => {
    const length = url.length;
    if (length <= 30) {
      return url;
    }
    return `${url.slice(0, 15)}...${url.slice(length - 10, length)}`;
  };

  return (
    <div className={styles.achievementButton}>
      <div className={styles.achievementText}>
        <h3 onClick={handleQRClick} style={{ cursor: 'pointer' }}>{name}</h3>
        <p>Reward: {reward}</p>
        <p>{remainingDays} days left</p>
      </div>
      {isSelected ? (
        <>
          <div className={styles.qrThumbnailContainer}>
            <button className={styles.unjoinButton} onClick={onUnselect}>-Unjoin</button>
            {link && (
              <div className={styles.qrThumbnail} onClick={handleQRClick}>
                <QRCodeSVG value={link} size={64} />
              </div>
            )}
          </div>
          {showQRDialog && (
            <div className={styles.qrDialog}>
              <div className={styles.qrDialogContent} ref={dialogRef}>
                <QRCodeSVG value={link} size={256} onClick={handleCopyLink} />
                <p className={styles.dialogLink} onClick={handleCopyLink} style={{ cursor: 'pointer' }}>{shortenUrl(link)}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <button className={styles.joinButton} onClick={onSelect}>+Join</button>
      )}
    </div>
  );
};

export default AchievementButton;
