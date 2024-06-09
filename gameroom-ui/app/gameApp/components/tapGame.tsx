'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TapGameModel } from '../../lib/definitions';
import { PiHandTapBold, PiClipboardBold, PiRocketBold, PiChartBarBold, PiArrowLeftBold  } from 'react-icons/pi';

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
  // Add more games as needed
];

const fetchTapGame = async (gameId: number): Promise<TapGameModel> => {
  return new Promise((resolve, reject) => {
    const game = fakeTapGames.find(game => game.id === gameId);
    if (game) {
      setTimeout(() => resolve(game), 1000); // Simulate network delay
    } else {
      setTimeout(() => reject(new Error('Game not found')), 1000); // Simulate network delay
    }
  });
};

const TapGame: React.FC<{ gameId: number }> = ({ gameId }) => {
  const router = useRouter();
  const [tapGame, setTapGame] = useState<TapGameModel | null>(null);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Ref);

  useEffect(() => {
    const loadTapGame = async () => {
      try {
        const gameData = await fetchTapGame(gameId);
        setTapGame(gameData);
      } catch (error) {
        console.error('Error fetching tap game:', error);
      }
    };

    loadTapGame();
  }, [gameId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case Tabs.Ref:
        return <div>Ref Content</div>;
      case Tabs.Task:
        return <div>Task Content</div>;
      case Tabs.Tap:
        return <div>Tap Content</div>;
      case Tabs.Boost:
        return <div>Boost Content</div>;
      case Tabs.Stats:
        return <div>Stats Content</div>;
      default:
        return null;
    }
  };

  if (!tapGame) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center p-4 h-full">
      <div className="flex-1 w-full">
        <div className="p-4 w-full border rounded">
          {renderTabContent()}
        </div>
      </div>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={() => router.back()}
          className={`p-2 bg-blue-500 text-white bg-gray-200'}`}>
          <PiArrowLeftBold size={24} />
        </button>
        <button onClick={() => setActiveTab(Tabs.Ref)} className={`p-2 ${activeTab === Tabs.Ref ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          <PiHandTapBold size={24} />
        </button>
        <button onClick={() => setActiveTab(Tabs.Task)} className={`p-2 ${activeTab === Tabs.Task ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          <PiClipboardBold size={24} />
        </button>
        <button onClick={() => setActiveTab(Tabs.Tap)} className={`p-2 ${activeTab === Tabs.Tap ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          <PiHandTapBold size={24} />
        </button>
        <button onClick={() => setActiveTab(Tabs.Boost)} className={`p-2 ${activeTab === Tabs.Boost ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          <PiRocketBold size={24} />
        </button>
        <button onClick={() => setActiveTab(Tabs.Stats)} className={`p-2 ${activeTab === Tabs.Stats ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          <PiChartBarBold size={24} />
        </button>
      </div>
    </div>
  );
};

export default TapGame;
