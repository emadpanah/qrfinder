// app/publicUI/components/WhitepaperLink.tsx
import Link from 'next/link';

const WhitepaperLink = () => {
  return (
    <Link href="/whitepaper">
      <div className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
        Read Whitepaper
      </div>
    </Link>
  );
};

export default WhitepaperLink;
