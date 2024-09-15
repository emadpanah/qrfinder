import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TapGameModel } from '../../lib/definitions';
import GameButton from '../components/GameButton';

interface MyGamesProps {
  onGameDoubleClick: (gameId: number) => void;
}

const MyGames: React.FC<MyGamesProps> = ({ onGameDoubleClick }) => {
  const router = useRouter();
  const [userGames, setUserGames] = useState<TapGameModel[]>([]);

  useEffect(() => {
    const fakeUserGames: TapGameModel[] = [
      {
        id: 1,
        title: 'Cayman Token',
        description: 'tap for enjoying Porsche ride for a day.',
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
        description: 'tap for having a Trezor hardware wallet.',
        needToken: 5000,
        winnerLimit: '10',
        tapAlgorithm: 'Algorithm 1',
        winnerAddresses: [],
        activeDate: '2025-06-15',
        image: '/trezor.png',
      },
    ];

    setUserGames(fakeUserGames);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {userGames.map(game => (
          <GameButton
            key={game.id}
            tapGame={game}
            route={`/game/${game.id}`}
            onDoubleClick={() => onGameDoubleClick(game.id)}
          />
        ))}
      </div>
      <div className="mt-4 w-full flex justify-end">
        <button
          onClick={() => router.push('/gameApp')}
          className="bg-gray-200 p-2 rounded"
        >
          Back to Hub
        </button>
      </div>
    </div>
  );
};

export default MyGames;
