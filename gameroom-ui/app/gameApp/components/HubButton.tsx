import React from 'react';
import { useRouter } from 'next/navigation';

interface HubButtonProps {
  label: string;
  route: string;
}

const HubButton: React.FC<HubButtonProps> = ({ label, route }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-700"
    >
      {label}
    </button>
  );
};

export default HubButton;
