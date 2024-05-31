// app/layout.tsx
import './ui/global.css'; // Import global styles if you have any
import Header from './publicUI/components/Header';
import Footer from './publicUI/components/Footer';
import { ReactNode } from 'react';
import { AccountType } from "@/app/lib/definitions";

interface LayoutProps  {
  children: ReactNode;
  accountData: AccountType;
}

export default function RootLayout({ children, accountData }: LayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header {...accountData} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
