import { Inter, Lusitana, Press_Start_2P, Noto_Sans_JP } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });

export const noto = Noto_Sans_JP({
  weight: ['900'],
  subsets: ['latin'],
});

export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const pressStart2P = Press_Start_2P({
  weight: ['400'],
  subsets: ['latin'],
});
