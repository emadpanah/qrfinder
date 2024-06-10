'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TapGameModel } from '../../lib/definitions';
import { PiHandTapBold, PiClipboardBold, PiRocketBold, PiChartBarBold, PiArrowLeftBold } from 'react-icons/pi';
import { FiUserPlus } from 'react-icons/fi';
import QRCode from 'qrcode.react';
import '../../ui/global.css';

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

const TabContent: React.FC<{ activeTab: Tabs; tapGame: TapGameModel; handleTap: () => void; tokenCount: number; maxTokenCount: number; countdownPosition: { x: number; y: number; show: boolean }; setCountdownPosition: (pos: { x: number; y: number; show: boolean }) => void; }> = ({ activeTab, tapGame, handleTap, tokenCount, maxTokenCount, countdownPosition, setCountdownPosition }) => {
  const [starPosition, setStarPosition] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (maxTokenCount <= 0) return;

    e.preventDefault(); // Prevent the default behavior
    e.stopPropagation(); // Stop propagation to avoid any other click events

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStarPosition({ x, y, show: true });

    // Call the handleTap function
    handleTap();
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
          <div className="text-3xl font-bold">{tapGame.needToken}</div>
          <div className="text-sm text-gray-500">{tapGame.title}</div>
          <div onClick={handleClick} className="relative noselect">
            <img src={tapGame.image} alt={tapGame.title} className="my-4 w-48 h-48 noselect" />
            {starPosition.show && (
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
                style={{ left: countdownPosition.x, top: countdownPosition.y }}
                onAnimationEnd={() => setCountdownPosition({ ...countdownPosition, show: false })}
              >
                -5
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div className="text-lg font-bold">{tokenCount}</div>
            <div className="text-sm text-gray-500">/ {maxTokenCount}</div>
          </div>
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${(tokenCount / maxTokenCount) * 100}%` }}></div>
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
  const [maxTokenCount, setMaxTokenCount] = useState<number>(1000); // Start max token count from 1000
  const [countdownPosition, setCountdownPosition] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const lastClickTimeRef = useRef<number>(Date.now());

  const handleTap = useCallback(() => {
    if (maxTokenCount <= 0) return;

    // Increment token count by 10 on each tap
    setTokenCount(prevCount => prevCount + 10);
    // Decrement max token count by 10 on each tap
    setMaxTokenCount(prevMax => prevMax - 10);
    lastClickTimeRef.current = Date.now();
  }, [maxTokenCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastClickTimeRef.current >= 2000) {
        setTokenCount(prevCount => {
          if (prevCount > 0) {
            const x = Math.random() * 192; // Random x within the width of the image (192px)
            const y = 192; // Fixed y position at the bottom of the image
            setCountdownPosition({ x, y, show: true });
          }
          return Math.max(0, prevCount - 5);
        });
        setMaxTokenCount(prevMax => Math.min(1000, prevMax + 5));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
        <TabContent activeTab={activeTab} tapGame={tapGame} tokenCount={tokenCount} maxTokenCount={maxTokenCount} handleTap={handleTap} countdownPosition={countdownPosition} setCountdownPosition={setCountdownPosition} />
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
