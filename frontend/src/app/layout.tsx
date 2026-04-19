import type { Metadata } from 'next';
import { Exo_2 } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const exo = Exo_2({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-exo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MeowTetr — Competitive Block Puzzle',
  description: 'Fast, competitive, and cute. MeowTetr is your online block puzzle arena.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={exo.variable}>
      <body className={`${exo.className} min-h-screen antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
