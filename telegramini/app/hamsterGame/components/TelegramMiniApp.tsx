'use client';

import loadTelegramScript from '../../utils/loadTelegramScript';
import styles from '../css/TelegramMiniApp.module.css';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { byekan } from '../../../public/fonts';
import { TonConnectButton } from '@tonconnect/ui-react'
import {TonConnectUIProvider} from "@tonconnect/ui-react"

const manifestUrl = 'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt';

const TelegramMiniApp: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [result, setResult] = useState<'win' | 'lose' | null>(null);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(1000);

  const WIN_PROBABILITY = 0.4;

  useEffect(() => {
    loadTelegramScript()
      .then(() => {
        if (window.Telegram) {
          window.Telegram.WebApp.ready();
          const user = window.Telegram.WebApp.initDataUnsafe?.user;
          if (user) {
            setTelegramId(user.id.toString());
          }
        }
      })
      .catch((err) => console.error('Failed to load Telegram Web App script', err));
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
    setTokens(1000); // Initialize tokens to 1000 at the start of the game
  };

  const handleFlip = () => {
    setLoading(true);
    setTimeout(() => {
      const flipResult = Math.random() < WIN_PROBABILITY ? 'win' : 'lose';
      setResult(flipResult);

      if (flipResult === 'win') {
        setTokens(tokens * 1.5);
      } else {
        setTokens(tokens * 0.5);
      }

      setIsFlipped(true);
      setLoading(false);
    }, 5000);
  };

  const handleResetGame = () => {
    setGameStarted(false);
    setIsFlipped(false);
    setResult(null);
    setLoading(false);
    setTokens(1000); // Reset tokens to 1000
  };


  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
    <div className={styles.container}>
    <TonConnectButton/>
          {telegramId && <div className={styles.telegramId}>Telegram ID: {telegramId}</div>}
          <div className={styles.tokens}>Tokens: {tokens.toFixed(2)}</div>
          {gameStarted ? (
            <div>
              <h1 className={`${styles.title} ${byekan.className}`}>خوش شانس 1.5 | بد شانس 0.05</h1>
              <div>
                {loading ? (
                  <div className={styles.loading}>Loading...</div>
                ) : isFlipped ? (
                  <img
                    src={result === 'win' ? '/win.jpg' : '/lose.jpg'}
                    alt={result === 'win' ? 'Win' : 'Lose'}
                    className={styles.coinImage}
                  />
                ) : (
                  <img src="/start.jpg" alt="Start Coin" className={styles.coinImage} />
                )}
              </div>
              <button className={`${styles.button} ${byekan.className}`}  onClick={handleFlip}>بنداز</button>
              <br/>
              <button className={`${styles.button} ${byekan.className}`}  onClick={handleResetGame}>شانس مجدد</button>
            </div>
          ) : (
            <div>
              <h1 className={`${styles.title} ${byekan.className}`}>هر کاربر تلگرام 1000 توکن ما را دریافت می کند</h1>
              <div className={`${styles.qrCode} ${styles.containerItems}`}>
                <QRCode value="https://farschain.com" size={256} />
              </div>
              <button className={`${styles.button} ${byekan.className}`}  onClick={handleStartGame}>شروع بازی</button>
            </div>
          )}
        </div>
    </TonConnectUIProvider>
    
  );
};

export default TelegramMiniApp;

