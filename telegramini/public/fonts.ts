import { Inter, Lusitana, Press_Start_2P, Noto_Sans_JP, Noto_Nastaliq_Urdu } from 'next/font/google';
import localFont from 'next/font/local';


export const inter = Inter({ subsets: ['latin'] });

export const noto = Noto_Sans_JP({
  weight: ['900'],
  subsets: ['latin'],
});

export const urdu = Noto_Nastaliq_Urdu({
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

export const byekan = localFont({
  src: [
    {
      path: '../public/fonts/BYEKAN.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/BYEKAN.woff',
      weight: '400',
      style: 'normal',
    },
  ],
});