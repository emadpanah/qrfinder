'use client';

import './ui/global.css'; // Import global styles if you have any
import Header from './publicUI/components/Header';
import Footer from './publicUI/components/Footer';
import { ReactNode, useState, useEffect } from 'react';
import { UserProvider } from './contexts/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LayoutProps {
  children: ReactNode;
}

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
    <html lang="en" className={theme}>
      <body className={`flex min-h-screen flex-col ${theme}`}>
        <UserProvider>
          <Header toggleTheme={toggleTheme} currentTheme={theme} />
          <main className="flex-grow">{children}</main>
          <Footer />
          <ToastContainer />
        </UserProvider>
      </body>
    </html>
  );
}
