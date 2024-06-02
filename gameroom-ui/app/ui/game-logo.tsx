import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function gameLogo() {
  return (
    <div
      className={` flex flex-row items-center leading-none text-white`}
    >
      <GlobeAltIcon className="h-6 w-6 rotate-[10deg]" />
      <p className="text-[18px]">Decentralized Product Engagement Platform</p>
    </div>
  );
}
