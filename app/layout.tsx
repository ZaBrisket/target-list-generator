import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Target List Generator',
  description: 'Transform Sourcescrub exports into executive-ready M&A target lists',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
