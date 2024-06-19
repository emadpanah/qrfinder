import { PiRobotBold    } from 'react-icons/pi';
import { lusitana } from '@/public/fonts';

export default function gameLogo() {
  return (
    <div
      className={` flex flex-row items-center leading-none text-white`}
    >
      <PiRobotBold  className="h-6 w-6 rotate-[10deg]" />
      <p className="text-[18px]">Decentralized Product Engagement Platform</p>
    </div>
  );
}
