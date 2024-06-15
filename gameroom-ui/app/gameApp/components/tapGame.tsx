'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TapGameModel } from '../../lib/definitions';
import { PiHandTapBold, PiClipboardBold, PiRocketBold, PiChartBarBold, PiArrowLeftBold } from 'react-icons/pi';
import { FiUserPlus } from 'react-icons/fi';
import QRCode from 'qrcode.react';
import '../../ui/global.css';
import { pressStart2P } from '../../ui/fonts';
import Image from 'next/image';


enum Tabs {
  Ref,
  Task,
  Tap,
  Boost,
  Stats,
}

const fakeTapGames: TapGameModel[] = [
  {
    id: 1,
    title: 'Cayman Token',
    description: 'Tap for enjoying Porsche ride for a day.',
    needToken: 5000,
    winnerLimit: '250',
    tapAlgorithm: 'Algorithm 1',
    winnerAddresses: [],
    activeDate: '2025-06-15',
    image: '/por.png',
  },
  {
    id: 2,
    title: 'Trezor HW',
    description: 'Tap for having a Trezor hardware wallet.',
    needToken: 5000,
    winnerLimit: '10',
    tapAlgorithm: 'Algorithm 1',
    winnerAddresses: [],
    activeDate: '2025-06-15',
    image: '/trezor.png',
  },
];

const fetchTapGame = async (gameId: number): Promise<TapGameModel> => {
  return new Promise((resolve, reject) => {
    const game = fakeTapGames.find(game => game.id === gameId);
    if (game) {
      setTimeout(() => resolve(game), 1000);
    } else {
      setTimeout(() => reject(new Error('Game not found')), 1000);
    }
  });
};

type Position = {
  x: number;
  y: number;
  show: boolean;
  type: string;
};

const TabContent: React.FC<{ activeTab: Tabs; tapGame: TapGameModel; handleTap: (e: React.MouseEvent<HTMLDivElement>) => void; tokenCount: number; maxTokenCount: number; countdownPosition: Position; setCountdownPosition: (pos: Position) => void; }> = ({ activeTab, tapGame, handleTap, tokenCount, maxTokenCount, countdownPosition, setCountdownPosition }) => {  const [starPosition, setStarPosition] = useState<Position>({ x: 0, y: 0, show: false, type: '+10' });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (maxTokenCount <= 0) return;
    e.preventDefault(); // Prevent the default behavior
    e.stopPropagation(); // Stop propagation to avoid any other click events
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleTap(e);
  };

  return (
    <>
      {activeTab === Tabs.Ref && (
        <div className="flex flex-col items-center">
          <div>Referral Content for {tapGame.title}</div>
          <QRCode value={`https://example.com/referral?gameId=${tapGame.id}`} size={150} />
        </div>
      )}
      {activeTab === Tabs.Task && <div>Task Content for {tapGame.title}</div>}
      {activeTab === Tabs.Tap && (
        <div className="flex flex-col items-center relative">
          <div className="ticker-wrapper">
            <div  className={'${pressStart2P.className} ticker '}>
              {tapGame.title} - {tapGame.needToken} Tokens - Active : {tapGame.activeDate} 
            </div>
          </div>
          <div className="my-2 bg-yellow-300 w-full flex items-center justify-center" style={{ height: 'calc(0.5 * 192px)' }}>
            <p className={`${pressStart2P.className} text-center font-bold`}>Advertisement Panel</p>
          </div>

          <div className="text-sm text-gray-500">{tapGame.title}</div>
          <div onClick={handleClick} className="relative noselect">
            <Image src={tapGame.image} alt={tapGame.title} className="my-4 w-48 h-48 noselect" />
            {starPosition.show && starPosition.type === '+10' && (
            <div
                className="star-animation"
                style={{ left: starPosition.x, top: starPosition.y }}
                onAnimationEnd={() => setStarPosition({ ...starPosition, show: false })}
            >
                +10
            </div>
        )}
       {countdownPosition.show && (
    <div
        className="countdown-animation"
        style={{ left: countdownPosition.x, top: countdownPosition.y, color: countdownPosition.type === '+10' ? '#0f0' : '#f00' }}
        onAnimationEnd={() => setCountdownPosition({ ...countdownPosition, show: false })}
    >
        {countdownPosition.type}
    </div>
)}


          </div>
          <div className="flex items-center">
            <div className="text-lg font-bold">{tokenCount}</div>
            <div className="text-sm text-gray-500">/ {maxTokenCount}</div>
          </div>
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${(tokenCount / 1000) * 100}%` }}></div>
          </div>
        </div>
      )}
      {activeTab === Tabs.Boost && (
        <div className="flex flex-col items-center">
          <div>Your daily boosters:</div>
          <div className="flex flex-col items-center">
            <div className="flex items-center my-2">
              <PiRocketBold size={24} />
              <div className="ml-2">Taping Guru: 3/3</div>
            </div>
            <div className="flex items-center my-2">
              <PiRocketBold size={24} />
              <div className="ml-2">Full Tank: 3/3</div>
            </div>
          </div>
          <div className="mt-4">Boosters:</div>
          <div className="flex flex-col items-center">
            <div className="flex items-center my-2">
              <PiRocketBold size={24} />
              <div className="ml-2">Boost X2: 0.5 TON</div>
            </div>
            <div className="flex items-center my-2">
              <PiHandTapBold size={24} />
              <div className="ml-2">Multitap: 500</div>
            </div>
            <div className="flex items-center my-2">
              <PiRocketBold size={24} />
              <div className="ml-2">Energy Limit: 500</div>
            </div>
          </div>
        </div>
      )}
      {activeTab === Tabs.Stats && (
        <div className="flex flex-col items-center">
          <div>Total Share Balance:</div>
          <div className="text-3xl font-bold">156.769 T</div>
          <div className="mt-4">Total Touches:</div>
          <div className="text-lg">1 723 090 562 120</div>
          <div className="mt-4">Total Players:</div>
          <div className="text-lg">46 934 280</div>
          <div className="mt-4">Daily Users:</div>
          <div className="text-lg">17 894 910</div>
          <div className="mt-4">Online Players:</div>
          <div className="text-lg">498 477</div>
        </div>
      )}
    </>
  );
};

const TapGame: React.FC<{ gameId: number }> = ({ gameId }) => {
  const router = useRouter();
  const [tapGame, setTapGame] = useState<TapGameModel | null>(null);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Tap); // Default to Tap tab
  const [tokenCount, setTokenCount] = useState<number>(0); // Start token count from 0
  const [maxTokenCount, setMaxTokenCount] = useState<number>(1010); // Start max token count from 1000
  const [countdownPosition, setCountdownPosition] = useState<Position>({ x: 0, y: 0, show: false, type: '-10' });
  const lastClickTimeRef = useRef<number>(Date.now());
  const clickTimesRef = useRef<number[]>([]);
  const [mouseMovements, setMouseMovements] = useState<number>(0);
  const MIN_MOUSE_MOVEMENTS = 5;
  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (maxTokenCount <= 0) return;

    const hiddenField = document.getElementById("honeypot-field") as HTMLInputElement;
    if (hiddenField && hiddenField.value !== "") {
      alert("Suspicious behavior detected. Please do not fill out hidden fields.");
      return;
    }

    // console.log('move-'+mouseMovements);
    // if (mouseMovements < MIN_MOUSE_MOVEMENTS) {
    //   alert("Suspicious behavior detected. Please interact more with the page.");
    //   return;
    // }
    const currentTime = Date.now();
    const clickInterval = currentTime - lastClickTimeRef.current;

    // Add the click interval to the array
    clickTimesRef.current.push(clickInterval);

    // If there are more than 10 intervals, remove the oldest one
    if (clickTimesRef.current.length > 10) {
      clickTimesRef.current.shift();
    }

    // Check for suspicious patterns
    const averageClickInterval = clickTimesRef.current.reduce((a, b) => a + b, 0) / clickTimesRef.current.length;
    //console.log(averageClickInterval);
    if (averageClickInterval < 120) {
      alert("Suspicious clicking behavior detected. Please slow down.");
      return;
    }

    lastClickTimeRef.current = currentTime;

    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tokenCount >= 1000) {
      setTokenCount(prevCount => Math.max(0, prevCount - 100));
      setMaxTokenCount(prevMax => Math.min(1000, prevMax + 100));
      setCountdownPosition({ x, y, show: true, type: '-100' });
    } else {
      setTokenCount(prevCount => prevCount + 10);
      setMaxTokenCount(prevMax => prevMax - 10);
      setCountdownPosition({ x, y, show: true, type: '+10' });
    }
}, [tokenCount, maxTokenCount]);

useEffect(() => {
  const handleMouseMove = () => {
    setMouseMovements(prev => prev + 1);
  };

    window.addEventListener('mousemove', handleMouseMove);

  const interval = setInterval(() => {
    const currentTime = Date.now();
    if (currentTime - lastClickTimeRef.current >= 2000) {
      setTokenCount(prevCount => {
        if (prevCount > 0) {  // Add this check to prevent tokenCount from going below zero
          const x = Math.random() * 192; // Random x within the width of the image (192px)
          const y = 192; // Fixed y position at the bottom of the image
          setCountdownPosition({ x, y, show: true, type: '-10' });
          return Math.max(0, prevCount - 10); // Ensure tokenCount doesn't go below zero
        }
        return prevCount; // Do nothing if prevCount is already 0
      });
      setMaxTokenCount(prevMax => Math.min(1010, prevMax + 10));
    }
  }, 2000);
  
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    clearInterval(interval);
  };

}, [mouseMovements]);

useEffect(() => {

    //return () => clearInterval(interval);
    const loadTapGame = async () => {
      try {
        const gameData = await fetchTapGame(gameId);
        setTapGame(gameData);
      } catch (error) {
        console.error('Error fetching tap game:', error);
        setTapGame(null);
      }
    };

    loadTapGame();

}, [gameId]);


  if (!tapGame) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center p-4 h-full">
      <div className="flex-1 w-full p-4 border rounded">
    <TabContent 
        activeTab={activeTab} 
        tapGame={tapGame} 
        tokenCount={tokenCount} 
        maxTokenCount={maxTokenCount} 
        handleTap={handleTap} 
        countdownPosition={countdownPosition} 
        setCountdownPosition={setCountdownPosition} 
    />
</div>
      <div className="flex space-x-4 mt-4 w-full justify-around">
        <button
          onClick={() => router.push('/myGames')}
          className="flex-1 p-2 bg-gray-200"
        >
          <PiArrowLeftBold size={24} />
        </button>
        <button
          onClick={() => setActiveTab(Tabs.Ref)}
          className={`flex-1 p-2 ${activeTab === Tabs.Ref ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <FiUserPlus size={24} />
        </button>
        <button
          onClick={() => setActiveTab(Tabs.Task)}
          className={`flex-1 p-2 ${activeTab === Tabs.Task ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <PiClipboardBold size={24} />
        </button>
        <button
          onClick={() => setActiveTab(Tabs.Tap)}
          className={`flex-1 p-2 ${activeTab === Tabs.Tap ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <PiHandTapBold size={24} />
        </button>
        <button
          onClick={() => setActiveTab(Tabs.Boost)}
          className={`flex-1 p-2 ${activeTab === Tabs.Boost ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <PiRocketBold size={24} />
        </button>
        <button
          onClick={() => setActiveTab(Tabs.Stats)}
          className={`flex-1 p-2 ${activeTab === Tabs.Stats ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          <PiChartBarBold size={24} />
        </button>
      </div>
    </div>
  );
};

export default TapGame;
