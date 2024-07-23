'use client';

import './ui/global.css'; // Import global styles if you have any
import Header from './publicUI/components/Header';
import Footer from './publicUI/components/Footer';
import { ReactNode, useState, useEffect } from 'react';
import { TonConnectUIProvider, THEME } from "@tonconnect/ui-react";
import { UserProvider } from './contexts/UserContext'; // Import the UserProvider

interface LayoutProps {
  children: ReactNode;
}

const manifestUrl = 'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt';

export default function RootLayout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} uiPreferences={{ theme: theme === 'dark' ? THEME.DARK : THEME.LIGHT }}>
      <html lang="en" className={theme}>
        <body className={`min-h-screen flex flex-col ${theme}`}>
          <UserProvider> {/* Wrap the content in UserProvider */}
            <Header toggleTheme={toggleTheme} currentTheme={theme} />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </UserProvider>
        </body>
      </html>
    </TonConnectUIProvider>
  );
}
