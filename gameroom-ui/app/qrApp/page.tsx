'use client'; // Add this line at the top

import React, { useState, useEffect } from 'react';
import CampaignHeader from './components/CampaignHeader';
import CampaignButton from './components/CampaignButton';
import MyAchievements from './components/MyAchievements';
import CampaignDetails from './components/CampaignDetails'; // Ensure this is imported
import { AccountType, Campaign } from '@/app/lib/definitions';
import { fetchActiveCampaigns } from '@/app/lib/api'; // Import the API function
import styles from './css/qrApp.module.css';

enum ActiveSection {
  Campaigns,
  MyAchievements,
  CampaignDetails,
}

const QRAppPage: React.FC = () => {
  const [accountData, setAccountData] = useState<AccountType>({
    address: null,
    balance: null,
    chainId: null,
    network: null,
  });
  const [activeSection, setActiveSection] = useState<ActiveSection>(ActiveSection.Campaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // Fetch campaigns data here
    const getCampaigns = async () => {
      try {
        const campaignsData = await fetchActiveCampaigns();
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    getCampaigns();
  }, []);

  const handleCampaignClick = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActiveSection(ActiveSection.CampaignDetails);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case ActiveSection.Campaigns:
        return (
          <div className={`${styles.container} ${styles.spaceY4} pt-4 md:pt-8 lg:pt-12`}>
            {campaigns.map((campaign) => (
              <CampaignButton
                key={campaign.id}
                campaign={campaign}
                onClick={() => handleCampaignClick(campaign.id)}
              />
            ))}
          </div>
        );
      case ActiveSection.MyAchievements:
        return <MyAchievements />;
      case ActiveSection.CampaignDetails:
        return selectedCampaignId ? <CampaignDetails campaignId={selectedCampaignId} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col before:from-white after:from-sky-200 py-2`}>
      <CampaignHeader {...accountData} />
      <div className="flex flex-col flex-1 justify-center items-center">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default QRAppPage;



// // app/qrApp/page.tsx
// 'use client'; // Add this line at the top

// import React, { useState, useEffect } from 'react';
// import CampaignHeader from './components/CampaignHeader';
// import CampaignButton from './components/CampaignButton';
// import MyAchievements from './components/MyAchievements';
// import CampaignDetails from './components/CampaignDetails'; // Ensure this is imported
// import { AccountType, Campaign } from '@/app/lib/definitions';
// import { fetchActiveCampaigns } from '@/app/lib/api'; // Import the API function
// import styles from '../qrApp/css/qrApp.module.css';

// enum ActiveSection {
//   Campaigns,
//   MyAchievements,
//   CampaignDetails,
// }

// const QRAppPage: React.FC = () => {
//   const [accountData, setAccountData] = useState<AccountType>({
//     address: null,
//     balance: null,
//     chainId: null,
//     network: null,
//   });
//   const [activeSection, setActiveSection] = useState<ActiveSection>(ActiveSection.Campaigns);
//   const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
//   const [campaigns, setCampaigns] = useState<Campaign[]>([]);

//   useEffect(() => {
//     // Fetch campaigns data here
//     const getCampaigns = async () => {
//       try {
//         const campaignsData = await fetchActiveCampaigns();
//         setCampaigns(campaignsData);
//       } catch (error) {
//         console.error('Error fetching campaigns:', error);
//       }
//     };

//     getCampaigns();
//   }, []);

//   const handleCampaignClick = (campaignId: string) => {
//     setSelectedCampaignId(campaignId);
//     setActiveSection(ActiveSection.CampaignDetails);
//   };

//   const renderActiveSection = () => {
//     switch (activeSection) {
//       case ActiveSection.Campaigns:
//         return (
//           <div className="space-y-4 pt-4 md:pt-8 lg:pt-12">
//             {campaigns.map((campaign) => (
//               <CampaignButton
//                 key={campaign.id}
//                 campaign={campaign}
//                 onClick={() => handleCampaignClick(campaign.id)}
//               />
//             ))}
//           </div>
//         );
//       case ActiveSection.MyAchievements:
//         return <MyAchievements />;
//       case ActiveSection.CampaignDetails:
//         return selectedCampaignId ? <CampaignDetails campaignId={selectedCampaignId} /> : null;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={`h-full flex flex-col before:from-white after:from-sky-200 py-2`}>
//       <CampaignHeader {...accountData} />
//       <div className="flex flex-col flex-1 justify-center items-center">
//         {renderActiveSection()}
//       </div>
//     </div>
//   );
// };

// export default QRAppPage;
