import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mainquesthq.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MainQuest — Find your direction. Make your move.',
  description: 'MainQuest is a practical growth programme for people ready to find direction, build real-world skills, and make their next move.',
  openGraph: {
    title: 'MainQuest — Find your direction. Make your move.',
    description: 'MainQuest is a practical growth programme for people ready to find direction, build real-world skills, and make their next move.',
    url: siteUrl,
    siteName: 'MainQuest',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MainQuest — Find your direction. Make your move.',
    description: 'MainQuest is a practical growth programme for people ready to find direction, build real-world skills, and make their next move.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#F1ECD8" />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
