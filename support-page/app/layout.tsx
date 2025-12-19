import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trellis Support - AI Goal Planning',
  description: 'Get help with Trellis, the AI-powered goal planning app. Find answers to common questions about managing your goals, syncing calendars, and maximizing your productivity.',
  keywords: 'Trellis, support, help, goal planning, AI, productivity, FAQ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
