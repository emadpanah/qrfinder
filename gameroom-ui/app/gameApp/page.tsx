'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ethers } from 'ethers';
import GameHeader from './components/gameHeader';
import axios from 'axios'; // Import axios
import HubButton from './components/hubButton';
import MyGames from './components/myGames';
import TapGame from './components/tapGame'; // Import the TapGame component
import { AccountType } from '@/app/lib/definitions';
import { PiHandTapBold, PiSkullBold, PiMegaphoneBold, PiRocketBold } from 'react-icons/pi';
import jwt from 'jsonwebtoken';
const IAM_SERVICE_URL = process.env.NEXT_PUBLIC_IAM_SERVICE_URL;
const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET || 'default_app_secret'; // Use a default value if the environment variable is not set

enum ActiveSection {
  MetaMaskLogin,
  HubButtons,
  MyGames,
  NewGames,
  Referrals,
  CreateGame,
  TapGame, // Add TapGame section
}

const GameAppPage: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountData, setAccountData] = useState<AccountType>({});
  const [activeSection, setActiveSection] = useState<ActiveSection>(ActiveSection.MetaMaskLogin);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  async function checkMetaMask() {
    //console.log('checkmeta');
    const ethereum = window.ethereum;
    if (typeof ethereum !== 'undefined') {
      try {
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });
        const address = accounts[0];
        const provider = new ethers.BrowserProvider(ethereum);
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();
        setAccountData({
          address,
          balance: ethers.formatEther(balance),
          chainId: network.chainId.toString(),
          network: network.name,
        });

        // const signResult = await ethereum.request({
        //   method: 'personal_sign',
        //   params: ['test msg', address],
        // });

        // console.log('signResult : ' + signResult);

        

       
      // Register or log in the user in the IAM service
      const response = await axios.post(`${IAM_SERVICE_URL}/iam/register`, {
        ethAddress: address,
        walletType:'metamask',
        clientSecret: APP_SECRET
      });

      const { token: authToken, isNewToken } = response.data;
      // Store the auth token (e.g., in localStorage)
      localStorage.setItem('authToken', authToken);
      if(isNewToken)
        {
            const per =
          await window.ethereum.request({
            "method": "wallet_requestPermissions",
            "params": [
              {
                "eth_accounts": {address}
              }
            ]
          }); 
        }

        setIsLoggedIn(true);
        setActiveSection(ActiveSection.HubButtons); // Move to hub buttons after login
      } catch (error: any) {
        if(error.code == 4001)
          {
            alert('Please confirm on MetaMask');
            checkMetaMask();
            return;
          }
        alert(`Please log in MetaMask - `+ error.code);
      }
    } else {
      alert('MetaMask not installed');
    }
  }

  useEffect(() => {
    checkMetaMask();
  }, []);

  const handleGameDoubleClick = (gameId: number) => {
    setSelectedGameId(gameId);
    setActiveSection(ActiveSection.TapGame);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case ActiveSection.MetaMaskLogin:
        return (
          <div className="grid gap-4">
            <Image
              src="https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTDSk5Wo4RJI1/1b363263141cf629b28155e2625b56c9/mm-logo.svg"
              alt="MetaMask"
              width={320}
              height={140}
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
            <button onClick={checkMetaMask} className="bg-black text-white p-4 rounded-lg">
              Connect to MetaMask
            </button>
          </div>
        );
        case ActiveSection.HubButtons:
          return (
            <div className="grid gap-4 pt-4 md:pt-8 lg:pt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HubButton label="My Games" onClick={() => setActiveSection(ActiveSection.MyGames)} icon={<PiHandTapBold />} />
                <HubButton label="New Games" onClick={() => setActiveSection(ActiveSection.NewGames)} icon={<PiSkullBold />} />
                <HubButton label="4cash Exchange" onClick={() => window.location.href = 'https://4cash.exchange'} icon={<PiMegaphoneBold />} />
                <HubButton label="Create Game" onClick={() => setActiveSection(ActiveSection.CreateGame)} icon={<PiRocketBold />} />
              </div>
            </div>
          );        
      case ActiveSection.MyGames:
        return <MyGames onGameDoubleClick={handleGameDoubleClick} />;
      case ActiveSection.NewGames:
        return <div>New Games Component</div>;
      case ActiveSection.Referrals:
        return <div>Referrals Component</div>;
      case ActiveSection.CreateGame:
        return <div>Create Game Component</div>;
      case ActiveSection.TapGame:
        return selectedGameId !== null ? <TapGame gameId={selectedGameId} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col before:from-white after:from-sky-200 py-2`}>
      <GameHeader {...accountData} />
      <div className="flex flex-col flex-1 justify-center items-center">
        {renderActiveSection()}
      </div>
    </div>
  );
};


export default GameAppPage;
