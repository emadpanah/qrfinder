'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ethers } from 'ethers';
import GameHeader from './components/gameHeader';
import HubButton from './components/HubButton';
import { AccountType } from "@/app/lib/definitions";

const GameAppPage: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountData, setAccountData] = useState<AccountType>({});

  async function checkMetaMask() {
    const ethereum = window.ethereum;
    // Check if MetaMask is installed
    if (typeof ethereum !== "undefined") {
      try {
        // Request access to the user's MetaMask accounts
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        // Get the connected Ethereum address
        const address = accounts[0];
        // Check address in console of web browser
        console.log("connected to MetaMask with address: ", address);
        // Create an ethers.js provider using the injected provider from MetaMask
        const provider = new ethers.BrowserProvider(ethereum);
        // Get the account balance
        const balance = await provider.getBalance(address);
        console.log("connected address balance: ", balance);
        // Get the network ID from MetaMask
        const network = await provider.getNetwork();
        console.log("connected to Network: ", network);
        // Update state with the results
        setAccountData({
          address,
          balance: ethers.formatEther(balance),
          // The chainId property is a bigint, change to a string
          chainId: network.chainId.toString(),
          network: network.name,
        });
        setIsLoggedIn(true); // Update the login state
      } catch (error: any) {
        alert(`Please log in MetaMask`);
      }
    } else {
      alert("MetaMask not installed");
    }
  }

  useEffect(() => {
    checkMetaMask();
  }, []);

  return (
    <div className={`h-full flex flex-col before:from-white after:from-sky-200 py-2`}>
      <GameHeader {...accountData} />
      <div className="flex flex-col flex-1 justify-center items-center">
        {!isLoggedIn ? (
          <div className="grid gap-4">
            <Image
              src="https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTDSk5Wo4RJI1/1b363263141cf629b28155e2625b56c9/mm-logo.svg"
              alt="MetaMask"
              width={320}
              height={140} // Add height attribute to maintain aspect ratio
              style={{ width: "auto", height: "auto" }} // Add inline styles to maintain aspect ratio
              priority
            />
            <button onClick={checkMetaMask} className="bg-black text-white p-4 rounded-lg">
              Connect to MetaMask
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HubButton label="My Games" route="/gameApp/pages/page1" />
              <HubButton label="New Games" route="/gameApp/pages/page2" />
              <HubButton label="Refferals" route="/gameApp/pages/page3" />
              <HubButton label="Create Game" route="/gameApp/pages/page4" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameAppPage;
