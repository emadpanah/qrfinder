// MyGames.tsx
import React, { useEffect, useState } from 'react';
import { TapGameModel } from '../../lib/definitions';
import GameButton from '../components/gameButton';

interface MyGamesProps {
  onDoubleClick: (gameId: number) => void;
}

const MyGames: React.FC<MyGamesProps> = ({ onDoubleClick }) => {
  const [userGames, setUserGames] = useState<TapGameModel[]>([]);

  useEffect(() => {
    // Fetch user's games from the database or service layer
    // For demonstration purposes, simulating user games data
    const fakeUserGames: TapGameModel[] = [
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
    setUserGames(fakeUserGames);
  }, []);

  return (
    <div className="grid grid-cols-// MyGames.tsx (continued)
    1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userGames.map((game) => (
            <GameButton
              key={game.id}
              tapGame={game}
              route={`/game/${game.id}`}
              onDoubleClick={() => onDoubleClick(game.id)} // Pass the double click handler
            />
          ))}
        </div>
      );
    };
    
    export default MyGames;
    
