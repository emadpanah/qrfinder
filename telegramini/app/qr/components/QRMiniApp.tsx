'use client';

import React, { useEffect, useState } from 'react';
import loadTelegramScript from '../../utils/loadTelegramScript';
import styles from '../css/QRMiniApp.module.css';
import QRCode from 'qrcode.react';
import { inter } from '../../../public/fonts';

const QRMiniApp: React.FC = () => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    loadTelegramScript()
      .then(() => {
        if (window.Telegram) {
          window.Telegram.WebApp.ready();
          const user = window.Telegram.WebApp.initDataUnsafe?.user;
          if (user) {
            setTelegramId(user.id.toString());
            // Fetch user's balance and campaigns
            fetchUserData(user.id.toString());
          }
        }
      })
      .catch((err) => console.error('Failed to load Telegram Web App script', err));
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();
      setBalance(data.balance);
      setCampaigns(data.campaigns);
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  };

  return (
    <div className={styles.container}>
      {telegramId && <div className={styles.telegramId}>Telegram ID: {telegramId}</div>}
      <div className={styles.walletSelector}>
        <select>
          <option>Wallet 1</option>
          <option>Wallet 2</option>
          {/* Add more wallets */}
        </select>
      </div>
      <div className={styles.tokens}>Balance: {balance} Tokens</div>
      <div>
        {campaigns.map((campaign) => (
          <div key={campaign.id} className={styles.campaignBox}>
            <div className={styles.campaignTitle}>{campaign.name}</div>
            <div className={styles.campaignDescription}>{campaign.description}</div>
            <a href="#" className="text-blue-400">Learn More</a>
            <div className={styles.achievements}>
              {/* {campaign.achievements.map((achievement, index) => (
                <div key={index} className={styles.achievementBox}>
                  <div className={styles.achievementTitle}>{achievement.title}</div>
                  <div className={styles.achievementDescription}>{achievement.description}</div>
                  <button className={styles.button}>Complete</button>
                </div>
              ))} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRMiniApp;
