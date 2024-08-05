import { PiRobotBold } from 'react-icons/pi';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';

const NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL;

export default function gameLogo() {
  return (
    <div className={`flex flex-row items-center leading-none text-white`}>
      <PiRobotBold className="h-6 w-6 rotate-[10deg]" />
      <Link href={`${NEXT_PUBLIC_APP_BASE_URL}/qrApp`}>
        <p className="text-[18px] p-1">Game to Gain</p>
      </Link>
    </div>
  );
}
