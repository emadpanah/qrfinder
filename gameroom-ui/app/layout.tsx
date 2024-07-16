'use client'
// app/layout.tsx
import './ui/global.css'; // Import global styles if you have any
import Header from './publicUI/components/Header';
import Footer from './publicUI/components/Footer';
import { ReactNode } from 'react';
import { useEffect, useState } from 'react';

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
      <body className={`min-h-screen flex flex-col ${theme}`}>
        <Header toggleTheme={toggleTheme} currentTheme={theme} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}