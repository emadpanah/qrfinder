// page.tsx in /app/gameApp directory

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useRouter } from 'next/router';

const GameAppPage: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkMetaMask() {
      if (typeof window !== 'undefined' && (window as any).ethereum !== undefined) {
        // MetaMask is installed
        const web3 = new Web3((window as any).ethereum);
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            // User is logged in
            setIsLoggedIn(true);
          } else {
            // User is not logged in
            setIsLoggedIn(false);
            // Redirect to login or home page
            router.push('/login'); // Adjust the route as per your application's setup
          }
        } catch (error) {
          // User denied account access or MetaMask is locked
          setIsLoggedIn(false);
          // Redirect to login or home page
          router.push('/login'); // Adjust the route as per your application's setup
        }
      } else {
        // MetaMask is not installed
        setIsLoggedIn(false);
        // Show message or redirect to page encouraging MetaMask installation
        router.push('/install-metamask'); // Adjust the route as per your application's setup
      }
    }

    checkMetaMask();
  }, []);

  // Your component logic here, conditionally render based on isLoggedIn state

  return (
    <div>
      {/* Example: Display different content based on user's login status */}
      {isLoggedIn ? (
        <p>User is logged in</p>
      ) : (
        <p>Please install MetaMask and login to continue</p>
      )}
    </div>
  );
};

export default GameAppPage;
