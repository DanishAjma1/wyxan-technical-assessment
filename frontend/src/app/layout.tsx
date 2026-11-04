import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wyxan Mini Browser — Custom .zz Web Engine',
  description:
    'A mini web browser running inside a single React/Next.js tab, powered by NestJS and MongoDB.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-sky-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
