import React from 'react';
import { Campaign } from '@/app/lib/definitions';
import styles from '../css/qrApp.module.css';
import {splitDescription} from "../../lib/utils"

interface CampaignButtonProps {
  campaign: Campaign;
  onClick: (campaignId: string) => void;
}

const CampaignButton: React.FC<CampaignButtonProps> = ({ campaign, onClick }) => {
  const handleClick = () => {
    console.log(`CampaignButton clicked: ${campaign._id}`);
    console.log(`Campaign: ${campaign.name}`);
    onClick(campaign._id);
  };

  const [line1, line2] = splitDescription(campaign.description, 35);

  return (
    <div
      className={`${styles.shadowLg} ${styles.bgDark} ${styles.textLight} ${styles.px4} ${styles.py2} ${styles.rounded} ${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween} ${styles.cursorPointer}`}
      onClick={handleClick}
    >
      <div>
        <h3 className={`${styles.textLg} ${styles.fontSemibold} text-center`}>{campaign.name}</h3>
        <p className={`${styles.textSm} ${styles.textGray400} text-center`}>
          {line1}<br />{line2}
        </p>
        {campaign.videoUrl && <video src={campaign.videoUrl} controls className="w-full h-auto mt-2" />}
      </div>
    </div>
  );
};

export default CampaignButton;
