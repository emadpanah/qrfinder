import React from 'react';
import { useRouter } from 'next/navigation';

interface GameButtonProps {
  label: string;
  route: string;
}

const GameButton: React.FC<GameButtonProps> = ({ label, route }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-700"
    >
      {label}
    </button>
  );
};

export default GameButton;
