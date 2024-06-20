
'use client'

import loadTelegramScript from '../../utils/loadTelegramScript';
import styles from '../../hamesterGame/css/TelegramMiniApp.module.css';


import React, { useEffect } from 'react';
import  QRCode  from 'qrcode.react';
import { noto } from '@/public/fonts';

const TelegramMiniApp: React.FC = () => {
  useEffect(() => {
    loadTelegramScript()
      .then(() => {
        if (window.Telegram) {
          window.Telegram.WebApp.ready();
          const user = window.Telegram.WebApp.initDataUnsafe?.user;
          console.log(user);
        }
      })
      .catch((err) => console.error('Failed to load Telegram Web App script', err));
  }, []);

  return (
    <div className={styles.container}>
       <h1 className={`${styles.title} ${noto.className}  `}>ハムスター テレグラム ミニアプリへようこそ</h1>
     <div className={styles.qrCode}>
        <QRCode value="https://farschain.com" size={256} />
      </div>
    </div>
  );
};

export default TelegramMiniApp;
