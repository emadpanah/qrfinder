// GameButton.tsx
import React from 'react';
import { TapGameModel } from '../../lib/definitions';

interface GameButtonProps {
  tapGame: TapGameModel;
  route: string;
  onDoubleClick: () => void;
}

const GameButton: React.FC<GameButtonProps> = ({ tapGame, route, onDoubleClick }) => {
  const { title, description, needToken, activeDate, image } = tapGame;

  return (
    <button
      onDoubleClick={onDoubleClick}
      className="relative inline-flex flex-col items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-indigo-500 rounded-lg shadow-md group"
      style={{ width: '200px', height: '200px' }}
    >
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-75 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease">
        <p className="text-lg font-bold">{title}</p>
        <p className="text-sm">{description}</p>
        <p className="text-sm">Tokens Needed: {needToken}</p>
        <p className="text-sm">Active Date: {activeDate}</p>
      </div>
    </button>
  );
};

export default GameButton;
