// app/publicUI/components/GameAppLink.tsx
import Link from 'next/link';

const GameAppLink = () => {
  return (
    <Link href="/gameApp">
      <div className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
        Explore Game App
      </div>
    </Link>
  );
};

export default GameAppLink;
