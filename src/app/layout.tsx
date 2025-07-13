import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import CssBaseline from '@mui/material/CssBaseline';
import ClientThemeProvider from '../components/ClientThemeProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PlayerProvider } from '../contexts/PlayerContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Podcast RSS Player',
  description: 'A podcast player that combines multiple RSS feeds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ClientThemeProvider>
            <PlayerProvider>
              <CssBaseline />
              {children}
            </PlayerProvider>
          </ClientThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
