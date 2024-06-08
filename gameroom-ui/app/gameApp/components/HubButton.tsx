// app/components/HubButton.tsx
import React from 'react';
import { useRouter } from 'next/navigation';

interface HubButtonProps {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

const HubButton: React.FC<HubButtonProps> = ({ label, route, icon }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="relative inline-flex items-center justify-center p-4 px-6 py-3 overflow-hidden font-medium text-indigo-600 transition duration-300 ease-out border-2 border-indigo-500 rounded-lg  shadow-md group"
      style={{ width: '200px', height: '200px' }} // Set width and height explicitly
    >
      <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-indigo-900 group-hover:translate-x-0 ease">
        {icon && React.cloneElement(icon as React.ReactElement, { className: 'text-4xl' })} {/* Increase icon size */}
      </span>
      <span className="absolute flex items-center justify-center w-full h-full text-indigo-600 transition-all duration-300 transform group-hover:translate-x-full ease">
        {label}
      </span>
      <span className="relative invisible">{label}</span>
    </button>
  );
};

export default HubButton;
