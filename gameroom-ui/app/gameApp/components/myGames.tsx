import React, { useEffect, useState } from 'react';
import { TapGameModel } from '../../lib/definitions';
import GameButton from '../components/gameButton';

interface MyGamesProps {
  onGameDoubleClick: (gameId: number) => void;
}

const MyGames: React.FC<MyGamesProps> = ({ onGameDoubleClick }) => {
  const [userGames, setUserGames] = useState<TapGameModel[]>([]);

  useEffect(() => {
    // Fetch user's games
    // Example fetch call:
    // fetch('/api/user/games')
    //   .then(response => response.json())
    //   .then(data => setUserGames(data))
    //   .catch(error => console.error('Error fetching user games:', error));

    // For demonstration purposes, simulating user games data
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
  );
};

export default MyGames;
