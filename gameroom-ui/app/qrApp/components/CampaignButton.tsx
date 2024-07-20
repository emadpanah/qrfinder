import React from 'react';
import { Campaign } from '@/app/lib/definitions';
import styles from '../css/qrApp.module.css';

interface CampaignButtonProps {
  campaign: Campaign;
  onClick: () => void;
}

const CampaignButton: React.FC<CampaignButtonProps> = ({ campaign, onClick }) => {
  return (
    <div className={`${styles.shadowLg} ${styles.bgDark} ${styles.textLight} ${styles.px4} ${styles.py2} ${styles.rounded} ${styles.flex} ${styles.itemsCenter} ${styles.justifyBetween}`} onClick={onClick}>
      <div>
        <h3 className={`${styles.textLg} ${styles.fontSemibold}`}>{campaign.name}</h3>
        <p className={`${styles.textSm} ${styles.textGray400}`}>{campaign.description}</p>
      </div>
      <div className={`${styles.bgGray700} ${styles.p2} ${styles.roundedFull}`}>
        <img src="/path-to-your-icon.png" alt="icon" className={`${styles.w8} ${styles.h8}`} />
      </div>
    </div>
  );
};

export default CampaignButton;


// // app/qrApp/components/CampaignButton.tsx
// import React from 'react';
// import { Campaign } from '@/app/lib/definitions';

// interface CampaignButtonProps {
//   campaign: Campaign;
//   onClick: () => void;
// }

// const CampaignButton: React.FC<CampaignButtonProps> = ({ campaign, onClick }) => {
//   return (
//     <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg flex items-center justify-between" onClick={onClick}>
//       <div>
//         <h3 className="text-lg font-semibold">{campaign.name}</h3>
//         <p className="text-sm text-gray-400">{campaign.description}</p>
//       </div>
//       <div className="bg-gray-700 p-2 rounded-full">
//         <img src="/path-to-your-icon.png" alt="icon" className="w-8 h-8" />
//       </div>
//     </div>
//   );
// };

// export default CampaignButton;
