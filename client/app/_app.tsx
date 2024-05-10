// src/pages/_app.js (or _app.tsx)
import '../src/styles/style.css'; // Import Tailwind CSS styles
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }:AppProps) {
  return <Component {...pageProps} />;
}

