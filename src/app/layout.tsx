import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CssBaseline from '@mui/material/CssBaseline';
import ClientThemeProvider from '../components/ClientThemeProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Podcast RSS Player",
  description: "A podcast player that combines RSS feeds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientThemeProvider>
          <CssBaseline />
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
