// app/layout.tsx
import './ui/global.css'; // Import global styles if you have any
import Header from './publicUI/components/Header';
import Footer from './publicUI/components/Footer';
import { ReactNode } from 'react';

interface LayoutProps  {
  children: ReactNode;
}

export default function RootLayout({ children}: LayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header  />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
