import React from 'react';
import GameButton from '../components/gameButton';

const MyGamesPage: React.FC = () => {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-2 gap-6">
        <GameButton label="Game 1" route="/games/game1" />
        <GameButton label="Game 2" route="/games/game2" />
      </div>
    </div>
  );
};

export default MyGamesPage;
