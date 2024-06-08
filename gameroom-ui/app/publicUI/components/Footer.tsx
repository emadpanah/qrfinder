import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-indigo-800 text-white p-4 text-center">
      <p>
        &copy; 2024 <Link href="https://farschain.com" className="underline">farschain.com</Link> All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
